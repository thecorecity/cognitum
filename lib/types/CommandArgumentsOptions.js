/**
 * Command arguments validation options.
 *
 * @typedef {Object} CommandArgumentsOptions
 * @property {number} [min] Minimal amount of arguments passed.
 * @property {number} [max] Maximal amount of arguments passed.
 * @property {(number|{mode: ArgumentsLengthValidationMode, value: number}|null)[]} [lengths] Array of argument string
 *     lengths. If only number passed then it will check lengths depending on lengthsMode parameter passed. If object
 *     with following parameters passed then it will check depending on object's `mode` parameter passed.
 * @property {ArgumentsLengthValidationMode} [lengthsMode="max"] Global length checking mode. May be overridden by
 *     local length mode in lengths array.
 * @property {(string[]|RegExp|null)[]} [values] Array of actual values validation. Can contains array of strings or
 *     RegExp for arguments testing. If null provided, then this argument will be skipped from validation.
 */
