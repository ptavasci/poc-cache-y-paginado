function getData() {
    console.info('Retrieving data from DB');
    const currentSeconds = new Date().getSeconds();
    const fixedElements = 100;
    const totalElements = fixedElements + currentSeconds;

    const data = Array.from({ length: totalElements }, (_, i) => (i + 1).toString());
    return data;
}

module.exports = getData;