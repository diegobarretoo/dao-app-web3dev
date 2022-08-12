import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import rede from "../scripts/0-rede.js";

import { Header } from './components/Header.jsx';
import { Home } from './pages/Home.jsx';
import { Mint } from './pages/Mint.jsx';
import { Members } from './pages/Members.jsx';

import { checkBalance } from './utils/checkBalance.js';
// import { ChainId } from '@thirdweb-dev/sdk'
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

const App = () => {
  // Usando os hooks que o thirdweb nos dá.
  const network = useNetwork();
  const address = useAddress();

  const connectWithMetamask = useMetamask();
  // console.log("👋 Address:", address);
  const navigate = useNavigate()
  const location = useLocation()

  // inicializar o contrato editionDrop
  const editionDrop = useEditionDrop("0x4AE1bF53236e04DC1c99Ec6Bb3EC94eE21C4c51b");
  
  const token = useToken("0x28a106356feb52A4f3508b42bEd0Eb43939Ff281");
  const vote = useVote("0x68014d94Dd5b148Eb3A8d290780c65677b807B64");

  // Variável de estado para sabermos se o usuário tem nosso NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // Guarda a quantidade de tokens que cada membro tem nessa variável de estado.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // Guarda todos os endereços dos nosso membros.
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingNFT, setIsCheckingNFT] = useState(false)

  
  
  // Esse useEffect pega todos os endereços dos nosso membros detendo nosso NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    const getAllMemberAddresses = async () => {
      // Do mesmo jeito que fizemos no arquivo 7-airdrop-token.js! Pegue os usuários que tem nosso NFT
      // com o tokenId 0.
      try {
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("🚀 Endereços de membros", memberAddresses);
      } catch (error) {
        console.error("falha ao pegar lista de membros", error);
      }
    };
    getAllMemberAddresses()

  }, [hasClaimedNFT, editionDrop.history]);

  // Esse useEffect pega o # de tokens que cada membro tem.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Pega todos os saldos.
    const getAllMemberBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("👜 Quantidades", amounts);
      } catch (error) {
        console.error("falha ao buscar o saldo dos membros", error);
      }
    };    
    getAllMemberBalances();

  }, [hasClaimedNFT, token.history]);

  // Agora, nós combinamos os memberAddresses e os memberTokenAmounts em um único array
  const memberList = useMemo(() => {
    // console.log('Lista de membros', memberAddresses)
    return memberAddresses.map((address) => {
      // Se o endereço não está no memberTokenAmounts, isso significa que eles não
      // detêm nada do nosso token.
      const member = memberTokenAmounts?.find(({ holder }) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      }
    });
  }, [memberAddresses, memberTokenAmounts]);

  

  // Verifica se o usuário tem NFT
  useEffect(() => {
    void async function() {
      // if (isLoading) {
      //   return
      // }
        
      // Se ele não tiver uma carteira conectada, saia!
      if (!address) {
        setHasClaimedNFT(false)
        !isLoading && navigate('/')
        console.log('SAIU')
        return
      }
      console.log('ENTROU')

      // navigate('/')

      setIsCheckingNFT(true)
      const res = await checkBalance(editionDrop, address)
      
      setHasClaimedNFT(res)
      setIsCheckingNFT(false)
      if (res) {
        navigate('/member')
      } else {
        navigate('/mint')
      }
    }()
  }, [address, editionDrop])

  const pull_data = (data) => {
    setHasClaimedNFT(data);
  }

  console.log(address)
  // console.log(address, isLoading, hasClaimedNFT)

  const isRinkebyNetwork = address && (network?.[0].data.chain.id !== rede)

  const elementVariable = useRef(null)
  useEffect(() => {
    if (!isLoading && !isRinkebyNetwork) {
      // console.log(elementVariable.current.children[1])
      if (!elementVariable.current.children[1]) {
        navigate('/')
      }
    }
  },[address])

  
  const loaderWrapper = document.querySelector('.wrapper');
  if (loaderWrapper) {
    setTimeout(() => {
      // loaderWrapper.classList.add('fade');
      // loaderWrapper.style.display = 'none';
      setIsLoading(false)
    }, 500)
  }

  // if (location.pathname !== '/member') {}
  
  if (isLoading || isCheckingNFT) {
    // if (location.pathname === '/member') {
    //   return
    // }
    return (
      <div className="wrapper">
        <div className="preloader"></div>
      </div>
    )    
  }

  // Verifica rede conectada
  //  if (address && (network?.[0].data.chain.id !== rede)) {
   if (isRinkebyNetwork) {
    return (
      <div className="unsupported-network">
        <h2>Por favor, conecte-se à rede Rinkeby</h2>
        <p>
          Essa dapp só funciona com a rede Rinkeby, por favor 
          troque de rede na sua carteira.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* {isLoading && <div className="wrapper">
        <div className="preloader"></div>
      </div>}
      {!isLoading &&
      <>  */}
      <div className="bg"></div>
      <div className="overlay"></div>
      <div className="wrap-page" ref={elementVariable}>
        <Header />
          <Routes>
            {address && hasClaimedNFT &&
              <Route
                path='/member'
                element={
                  <Members
                    memberList={memberList}
                    hasClaimedNFT={hasClaimedNFT}
                    vote={vote}
                    address={address}
                    token={token}
                  />
                }
              />
            }

            {!address && !hasClaimedNFT &&
              <Route
                exact
                path='/'
                element={
                  <Home
                    connectWithMetamask={connectWithMetamask}
                    address={address}
                    hasClaimedNFT={hasClaimedNFT}
                  />
                }
              />
            }

            {address && !hasClaimedNFT && !isCheckingNFT &&
              <Route
                path='/mint'
                element={
                  <Mint
                    editionDrop={editionDrop}
                    func={pull_data}
                    hasClaimedNFT={hasClaimedNFT}
                    address={address}
                  />
                }
              />
            }
          </Routes>
      </div>
      {/* </>}    */}
    </>
  )

};

export default App;
