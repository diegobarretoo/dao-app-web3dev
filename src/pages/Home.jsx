import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Home({ connectWithMetamask, address, hasClaimedNFT }) {
    let navigate = useNavigate();

    // useEffect(() => {
        
    //     // if(address && !hasClaimedNFT) {
    //     //     navigate('/mint')            
    //     // }
    //     console.log('EFFECT HOME', address)
        
    // },[address, hasClaimedNFT])

    console.log('home')
    
    return (
        <div className="landing">
            {/* <h1>Pronto para começar?</h1> */}
            <h1>Seja membro e vote em propostas na DAO</h1>
            <p>Inicie a DAO e comece a causar impacto no Moon DAO Metaverso.</p>

            <div className="wrap-btn">
                <button 
                    onClick={ async () => {
                        const res = await connectWithMetamask()
                        if (!res.error) {
                            console.log('ACEITO')
                            // navigate('/mint')
                        } else {
                            console.log('RECUSADO')
                        }
                    }}
                    // onClick={connectWithMetamask}
                    className="btn-main">
                    Conecte sua carteira
                </button>
                <a href="https://www.youtube.com/watch?v=v3esRm4M5Fw" target="_blank" className="btn-main style2">
                    Assistir ao Vídeo
                </a>
            </div>
        </div>
    );
}
