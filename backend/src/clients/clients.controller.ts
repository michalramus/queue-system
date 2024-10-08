import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards, Request } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Roles } from "../auth/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Entity } from "src/auth/types/entity.class";

@Controller("clients")
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Post()
    @Roles(["Device", "User", "Admin"])
    @UseGuards(JwtAuthGuard, RolesGuard)
    create(@Body(ValidationPipe) createClientDto: CreateClientDto, @Request() req) {
        return this.clientsService.create(createClientDto, Entity.convertFromReq(req));
    }

    @Get()
    @Roles(["Device", "User", "Admin"])
    @UseGuards(JwtAuthGuard, RolesGuard)
    findAll() {
        return this.clientsService.findAll();
    }

    @Patch(":id")
    @Roles(["User", "Admin"])
    @UseGuards(JwtAuthGuard, RolesGuard)
    update(@Param("id") id: string, @Body(ValidationPipe) updateClientDto: UpdateClientDto, @Request() req) {
        return this.clientsService.update(id, updateClientDto, Entity.convertFromReq(req));
    }

    @Post(":id/call-again")
    @Roles(["User", "Admin"])
    @UseGuards(JwtAuthGuard, RolesGuard)
    findOne(@Param("id") id: string, @Request() req) {
        return this.clientsService.callAgain(id, Entity.convertFromReq(req));
    }

    @Delete(":id")
    @Roles(["User", "Admin"])
    @UseGuards(JwtAuthGuard, RolesGuard)
    remove(@Param("id") id: string, @Request() req) {
        return this.clientsService.remove(id, Entity.convertFromReq(req));
    }
}
