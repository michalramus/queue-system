"use client";

import Header from "@/components/header";
import NumberGetterButton from "./NumberGetterButton";
import * as clientsApi from "@/api/clients";
import {ClientNumber} from '@/api/clients';

async function reqForNum(category: string) {
    let res:ClientNumber = await clientsApi.addClient(category);
    console.log(res);
    console.log(res.number);
    alert(res.number);
}

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <Header>Queue System</Header>

            <div className="mt-20 flex w-full flex-col items-center">
                <NumberGetterButton category="Cat 1" onClick={reqForNum}>
                    Cat 1
                </NumberGetterButton>
                <NumberGetterButton category="Category 15" onClick={reqForNum}>
                    Category 15
                </NumberGetterButton>
                <NumberGetterButton category="XXX  ąć" onClick={reqForNum}>
                    XXX ąć
                </NumberGetterButton>
                <NumberGetterButton category="abaca" onClick={reqForNum}>
                    abaca
                </NumberGetterButton>
            </div>
        </main>
    );
}
