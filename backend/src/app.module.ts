import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClientsModule } from "./clients/clients.module";
import { DatabaseModule } from "./database/database.module";
import { WebsocketsModule } from "./websockets/websockets.module";
import { CategoriesModule } from "./categories/categories.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
    imports: [
        ClientsModule,
        DatabaseModule,
        WebsocketsModule,
        CategoriesModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "static"),
            serveStaticOptions: {
                extensions: ["wav"],
                index: false,
                redirect: true,
            },
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
