"use client";

import React, { ReactNode } from "react";
import { ClientNumber, removeClient, setClientAsInService } from "@/utils/api/CSR/clients";
import { useMutation } from "@tanstack/react-query";
import Table from "@/components/Table";
import Button from "@/components/Buttons/Button";
import AcceptIcon from "../../components/svg/AcceptIcon";
import RejectIcon from "@/components/svg/RejectIcon";

/**
 * Table with clients waiting for service
 * @param categoryIds - clients with these categories will be displayed
 * @component
 */
export default function ClientTable({
    clientNumbers,
    categoryIds,
    seat,
}: {
    clientNumbers: ClientNumber[] | undefined;
    categoryIds: string[];
    seat: number;
}) {
    //----------------------------------------
    //Api calls

    // set client as in service
    const clientInService = useMutation({
        mutationFn: (clientNumber: ClientNumber) => setClientAsInService(clientNumber, seat),
    });

    // remove client
    const deleteClient = useMutation({
        mutationFn: (clientNumber: ClientNumber) => removeClient(clientNumber),
    });
    //----------------------------------------


    //Prepare table content
    const filteredClientNumbers = clientNumbers?.filter(
        (client) => categoryIds.indexOf(client.categoryId) != -1,
    );

    const columns = ["Number", "Category", "Creation Date", ""];
    const rows: (string | number | ReactNode | null)[][] = [];
    filteredClientNumbers?.forEach((client) =>
        rows.push([
            <span className="text-2xl font-bold">{client.number}</span>,
            <span className="text-lg text-gray-1">{client.category.name}</span>,
            <span className="text-base">
                {new Date(client.creationDate).toLocaleTimeString("pl-PL")}
                <br />
                <span className="text-gray-1">
                    {new Date(client.creationDate).toLocaleDateString("en-EN", {
                        hour12: false,
                    })}
                </span>
            </span>,
            <span className="flex flex-grow flex-wrap-reverse justify-center ">
                <Button
                    onClick={() => deleteClient.mutate(client)}
                    color="red"
                    className="flex items-center"
                >
                    <span className="mr-2">Delete</span>
                    <AcceptIcon />
                </Button>
                <Button
                    onClick={() => clientInService.mutate(client)}
                    color="green"
                    className="flex items-center"
                >
                    <span className="mr-2">Choose</span>
                    <RejectIcon />
                </Button>
            </span>,
        ]),
    );

    return <Table columns={columns} rows={rows} />;
}
