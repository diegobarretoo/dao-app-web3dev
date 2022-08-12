import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Mint({ editionDrop, func, hasClaimedNFT, address }) {

    // isClaiming nos ajuda a saber se está no estado de carregando enquanto o NFT é cunhado.
    const [isClaiming, setIsClaiming] = useState(false);

    let navigate = useNavigate();

    // useEffect(() => {
    //     console.log('effect no page-mint')
    //     if(!address) {
    //         navigate('/')            
    //     }
        
        
    // },[address])

    console.log(hasClaimedNFT, 'mint')

    const mintNft = async () => {
        try {
            setIsClaiming(true);          
            await editionDrop.claim("0", 1);
            console.log(`🌊 Cunhado com sucesso! Olhe na OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`);
            func(true)
            // setHasClaimedNFT(true);
        } catch (error) {
            func(false)
            // setHasClaimedNFT(false);
            console.error("Falha ao cunhar NFT", error);
        } finally {
          setIsClaiming(false);
        }
    };

    return (
        <div className="mint-nft">
            <h1>Cunhe gratuitamente seu NFT de membro da Moon DAO</h1>
            <button
                className="btn-main"
                disabled={isClaiming}
                onClick={mintNft}
            >
                {isClaiming ? "Cunhando..." : "Cunhar NFT free"}
            </button>
        </div>
    );
}
