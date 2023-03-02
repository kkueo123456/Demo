export const handleText = (str) => {
    str ??= ''
    return str.substr(0, 5) + '.....' + str.substr(-5)
}