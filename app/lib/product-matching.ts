export function findBestProductMatch(description: string, allProducts: any[]) {
    const normalize = (str: string) => str.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const target = normalize(description);

    let product = allProducts.find(p => {
        const pName = normalize(p.name);
        return pName === target;
    });

    if (!product) {
        const simpleTarget = target.replace(/s\b/g, '');

        product = allProducts.find(p => {
            const pName = normalize(p.name);
            const simpleName = pName.replace(/s\b/g, '');
            return simpleName === simpleTarget || simpleName.includes(simpleTarget) || simpleTarget.includes(simpleName);
        });
    }

    return product;
}
