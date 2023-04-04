export interface AuthTokenState {
    access_token: string | null;
    refresh_token: string | null;
};

export interface Order {
    orderId: string,
    lineItems:any[]    
}

interface OrderData {
    next: string;
    orders: Order[]; // assuming `Order` is the type of the `orders` array items
    error: { message: string } | null,
    warning: { message: string } | null
}

/*export interface GetOrdersResponse {
    orders:Order[],
    next: string|null,
    error : { message: string },
    warning: { message: string }
}
*/