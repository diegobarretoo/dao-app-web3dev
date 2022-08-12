export const checkBalance = async ( editionDrop, address ) => {
    try {
      const balance = await editionDrop.balanceOf(address, 0)
      // Se o saldo de nft for maior do que 0, ele tem nosso NFT!
      if (balance.gt(0)) {
        console.log("🌟 esse usuário tem o NFT de membro!")
        return true
      } else {
        console.log("😭 esse usuário NÃO tem o NFT de membro.")
        return false
      }
    } catch (error) {
      console.error("Falha ao ler saldo", error)
      return false
    }
}
