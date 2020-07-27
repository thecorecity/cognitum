/**
 * Command arguments validation options.
 *
 * @typedef {Object} CommandArgumentsOptions
 * @property {number} [min] Minimal amount of arguments passed.
 * @property {number} [max] Maximal amount of arguments passed.
 * @property {(number|{mode: ArgumentsLengthValidationMode, value: number})[]} [lengths] Array of argument string
 *     lengths. If only number passed then it will check lengths depending on lengthsMode parameter passed. If object
 *     with following parameters passed then it will check depending on object's `mode` parameter passed.
 * @property {ArgumentsLengthValidationMode} [lengthsMode="max"] Global length checking mode. May be overridden by
 *     local length mode in lengths array.
 */
