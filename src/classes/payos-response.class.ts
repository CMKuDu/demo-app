interface DataResponse {
    accountNumber: string;
    amount: number;
    code: string;
    counterAccountBankId: string;
    counterAccountBankName: string;
    counterAccountName: string;
    counterAccountNumber: string;
    currency: string;
    desc: string;
    description: string;
    orderCode: string;
    paymentLinkId: string;
    reference: string;
    transactionDateTime: string;
    virtualAccountName: string;
    virtualAccountNumber: string;
}

export interface PayosResponse {
    code: string;
    desc: string;
    success: boolean;
    signature: string;
    data: DataResponse;
}
