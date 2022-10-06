import { inflect } from 'inflection';

/**
 * Formats a PydanticError into a nice error message.
 *
 * @param error The PydanticError to format
 * @returns A nice error message
 */
export function niceErrorMessage(error: PydanticError): string {
    if (error.ctx.limit_value) {
        return 'Please ensure that you provide at least ' + error.ctx.limit_value + ' ' + inflect('character', error.ctx.limit_value) + '.';
    } else {
        return error.msg;
    }
}
