import { fetchSSRMiddleware } from "./fetchSSRMiddleware";
import { CategoryInterface } from "../CSR/categories";

const apiPath = "/categories";

export async function getCategoriesSSR(): Promise<CategoryInterface[]> {
    const response = await fetchSSRMiddleware((cookie) =>
        fetch(process.env.NEXT_PUBLIC_BACKEND_URL + apiPath, {
            method: "GET",
            credentials: "include",
            headers: { Cookie: cookie },
        }),
    );

    const res = await response.json();
    return res;
}
