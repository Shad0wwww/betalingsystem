

export default function toDKK(amount: number, translate: boolean = true): string {

    /** 
     * Converts a number to a DKK currency string. If translate is true, it assumes the input amount is in øre and converts it to DKK by dividing by 100. Otherwise, it treats the input as already in DKK. The output is formatted according to Danish locale conventions.
     * @param amount - The amount to convert, either in øre (if translate is true) or in DKK (if translate is false).
     * @param translate - A boolean indicating whether to convert from øre to DKK.
     * @returns A string representing the formatted currency in DKK.

    */

    if (translate) {
        return new Intl.NumberFormat("da-DK", {
            style: "currency",
            currency: "DKK",
            minimumFractionDigits: 2,
        }).format(amount / 100);

    } else {
        return new Intl.NumberFormat("da-DK", {
            style: "currency",
            currency: "DKK",
            minimumFractionDigits: 2,
        }).format(amount);
    }
    
 
}