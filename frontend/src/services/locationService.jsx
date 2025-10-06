import axios from "axios";

const httpCAS = axios.create();

export async function getProvinces() {
    const { data } = await httpCAS.get(
        `/cas/address-kit/2025-07-01/provinces`
    );
    return data;
}

export async function getCommunes(provinceId = "01") {
    const { data } = await httpCAS.get(
        `/cas/address-kit/2025-07-01/provinces/${provinceId}/communes`
    );
    return data;
}


