import api from "@/services/api"
import type { ImportResult } from "@/types"

type ImportStatementPayload = {
    accountId: number
    bank: string
    file: File
}

export const importService = {
    importStatement: async ({
        accountId,
        bank,
        file,
    }: ImportStatementPayload): Promise<ImportResult> => {
        const formData = new FormData()
        formData.append("account_id", String(accountId))
        formData.append("bank", bank)
        formData.append("file", file)

        const response = await api.post("/import/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    },
}
