import { ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { DevicesService } from "../devices/devices.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { Entity } from "./types/entity.class";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly devicesService: DevicesService,
        private readonly jwtService: JwtService,
    ) {}

    private logger = new Logger(AuthService.name);

    readonly accessTokenExpirationTime = "5m";
    readonly refreshTokenExpirationTime = "90d";

    /**
     * Refresh token of device never expires
     * @param headers
     * @returns
     */
    async RegisterDevice(headers: { "user-agent": string }, ip: string) {
        const device = await this.devicesService.create(headers["user-agent"]);

        this.logger.log(`Registered new device ${ip} ${JSON.stringify(device)}`);

        const payload = new Entity(device.deviceId, "Device", `Device ${device.deviceId}`).getJwtPayload();
        return {
            device,
            access_token: await this.jwtService.signAsync(payload, {
                expiresIn: this.accessTokenExpirationTime,
                secret: process.env.JWT_SECRET_KEY,
            }),
            //Refresh token never expires
            refresh_token: await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_TOKEN_KEY,
            }),
        };
    }

    async login(loginUserDto: LoginUserDto, ip: string) {
        const user = await this.validateUser(loginUserDto.username, loginUserDto.password);

        if (!user) {
            this.logger.warn(
                `Unauthorized Exception: Failed attempt to log into "${loginUserDto.username}" account from ${ip} `,
            );
            throw new UnauthorizedException("Incorrect username or password");
        }

        this.logger.log(`[${loginUserDto.username}] Successful login`);
        const payload = new Entity(user.userId, "User", user.username).getJwtPayload();
        return {
            user,
            access_token: await this.jwtService.signAsync(payload, {
                expiresIn: this.accessTokenExpirationTime,
                secret: process.env.JWT_SECRET_KEY,
            }),
            refresh_token: await this.jwtService.signAsync(payload, {
                expiresIn: this.refreshTokenExpirationTime,
                secret: process.env.JWT_REFRESH_TOKEN_KEY,
            }),
        };
    }

    async refresh(entity: Entity, ip: string) {
        const payload = entity.getJwtPayload();

        // Check if entity still exists
        if (entity.type == "User" && !(await this.usersService.findOneById(entity.id))) {
            this.logger.warn(
                `[${entity.type}: ${entity.id}] Unauthorized Exception: Deleted user tried to retrieve new access token from ${ip}`,
            );
            throw new UnauthorizedException("User does not exist");
        }

        return {
            access_token: await this.jwtService.signAsync(payload, {
                expiresIn: this.accessTokenExpirationTime,
                secret: process.env.JWT_SECRET_KEY,
            }),
            refresh_token: await this.jwtService.signAsync(payload, {
                expiresIn: this.refreshTokenExpirationTime,
                secret: process.env.JWT_REFRESH_TOKEN_KEY,
            }),
        };
    }

    async validateUser(username: string, password: string) {
        const user = await this.usersService.findOneByUsername(username);

        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    async validateRoles(
        request: { ip; method; url; user; body },
        roles: ("Device" | "User" | "Admin")[],
    ): Promise<boolean> {
        const entity = Entity.convertFromReq(request);
        const { ip, method, url } = request;

        switch (entity.type) {
            case "User":
                const user = await this.usersService.findOneById(entity.id);

                if (!user) {
                    this.logger.warn(`[${entity.name}] Deleted user tried to access ${method} ${url} from ${ip} `);
                    throw new UnauthorizedException("User is deleted");
                }

                if (roles.includes(user.role)) {
                    return true;
                }

                break;
            case "Device":
                const device = await this.devicesService.findOne(entity.id);

                if (!device) {
                    this.logger.warn(`[${entity.name}] Unauthorized Exception: Deleted device tried to access ${method} ${url} from ${ip} `);
                    throw new UnauthorizedException("Device is deleted");
                }

                if (roles.includes("Device") && device.accepted) {
                    return true;
                }

                break;
        }

        this.logger.warn(
            `[${entity.name}] Forbidden Exception: Too low permissions to access ${method} ${url} ${ip} ${request.body && Object.keys(request.body).length > 0 ? JSON.stringify(request.body) : ""}`,
        );
        throw new ForbiddenException("You do not have permissions to access this path");
    }
}
