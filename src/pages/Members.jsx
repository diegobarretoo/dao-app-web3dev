import { useEffect, useState } from "react";
import { AddressZero } from "@ethersproject/constants";
import photo from '../assets/moon2.png'
import { useDisconnect } from "@thirdweb-dev/react";

export function Members({ memberList, hasClaimedNFT, vote, address, token }) {

    const disconnect = useDisconnect();

    const [isVoting, setIsVoting] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);

    const [isLoading, setIsLoading] = useState(true)

    console.log('member')

    // Uma função para diminuir o endereço da carteira de alguém, não é necessário mostrar a coisa toda.
    const shortenAddress = (str) => {
        return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

    // Recupere todas as propostas existentes no contrato. 
    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }

        // Uma chamada simples para vote.getAll() para pegar as propostas.
        const getAllProposals = async () => {
            try {
                const proposals = await vote.getAll();
                setProposals(proposals);
                console.log("🌈 Propostas:", proposals);
            } catch (error) {
                console.log("falha ao buscar propostas", error);
            }
        };
        getAllProposals();
    }, [hasClaimedNFT, vote]);
  
    // Nós também precisamos checar se o usuário já votou.
    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }
    
        // Se nós não tivermos terminado de recuperar as propostas do useEffect acima
        // então ainda nao podemos checar se o usuário votou!
        if (!proposals.length) {
            return;
        }
    
        const checkIfUserHasVoted = async () => {
            try {
                const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
                setHasVoted(hasVoted);
                setIsLoading(false)
                if (hasVoted) {
                    console.log("🥵 Usuário já votou");
                } else {
                    console.log("🙂 Usuário ainda não votou");
                }
            } catch (error) {
                console.error("Falha ao verificar se carteira já votou", error);
            }
        };
        checkIfUserHasVoted();
    
    }, [hasClaimedNFT, proposals, address, vote]);

    if (isLoading) {
        return (
          <div className="wrap-preloader-member">
            <div className="preloader"></div>
          </div>
        )    
    }

    return (
        <div className="member-page">
            <div className="profile">
                <div className="profile-photo">
                    <img src={photo} alt="Astronauta na Lua"/>
                </div>
                <div className="profile-address">{shortenAddress(address)}</div>
                <button onClick={disconnect} className="disconnect btn-main style2">Disconnect</button>
            </div>                
            {/* <h1>🌚 Página dos membros da DAO</h1>
            <p>Parabéns por fazer parte desse clube de jogadores!</p> */}
            <div className="wrap-member-datas">
                    <h2>Lista de Membros</h2>
                    <h2>Propostas Ativas ({proposals.length})</h2>
                <div className="member-list">
                    <table className="card">
                        <thead>
                            <tr>
                                <th>Endereço</th>
                                <th>Quantidade de Tokens</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberList.map((member) => {
                            return (
                                <tr key={member.address}>
                                    <td>{shortenAddress(member.address)}</td>
                                    <td>{member.tokenAmount}</td>
                                </tr>
                            )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="active-proposals">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            //antes de fazer as coisas async, desabilitamos o botão para previnir duplo clique
                            setIsVoting(true)

                            // pega os votos no formulário 
                            const votes = proposals.map((proposal) => {
                                const voteResult = {
                                    proposalId: proposal.proposalId,
                                    //abstenção é a escolha padrão
                                    vote: 2,
                                }
                                proposal.votes.forEach((vote) => {
                                    const elem = document.getElementById(proposal.proposalId + "-" + vote.type)

                                    if (elem.checked) {
                                        voteResult.vote = vote.type
                                        return
                                    }
                                })
                                return voteResult
                            })

                            // certificamos que o usuário delega seus tokens para o voto
                            try {
                                //verifica se a carteira precisa delegar os tokens antes de votar
                                const delegation = await token.getDelegationOf(address)
                                // se a delegação é o endereço 0x0 significa que eles não delegaram seus tokens de governança ainda
                                if (delegation === AddressZero) {
                                    //se não delegaram ainda, teremos que delegar eles antes de votar
                                    await token.delegateTo(address)
                                }

                                // então precisamos votar nas propostas
                                try {
                                    await Promise.all(
                                        votes.map(async ({ proposalId, vote: _vote }) => {
                                            // antes de votar, precisamos saber se a proposta está aberta para votação
                                            // pegamos o último estado da proposta
                                            const proposal = await vote.get(proposalId)
                                            // verifica se a proposta está aberta para votação (state === 1 significa está aberta)
                                            if (proposal.state === 1) {
                                                // se está aberta, então vota nela
                                                return vote.vote(proposalId, _vote)
                                            }
                                            // se a proposta não está aberta, returna vazio e continua
                                            return
                                        })
                                    )
                                    try {
                                        // se alguma proposta está pronta para ser executada, fazemos isso
                                        // a proposta está pronta para ser executada se o estado é igual a 4
                                        await Promise.all(
                                            votes.map(async ({ proposalId }) => {
                                                // primeiro pegamos o estado da proposta novamente, dado que podemos ter acabado de votar
                                                const proposal = await vote.get(proposalId)
                                                //se o estado é igual a 4 (pronta para ser executada), executamos a proposta
                                                if (proposal.state === 4) {
                                                    return vote.execute(proposalId)
                                                }
                                            })
                                        )
                                        // se chegamos aqui, significa que votou com sucesso, então definimos "hasVoted" como true
                                        setHasVoted(true)
                                        console.log("votado com sucesso")
                                    } catch (err) {
                                        console.error("falha ao executar votos", err)
                                    }
                                } catch (err) {
                                    console.error("falha ao votar", err)
                                }
                            } catch (err) {
                                console.error("falha ao delegar tokens")
                            } finally {
                                // de qualquer modo, volta isVoting para false para habilitar o botão novamente
                                setIsVoting(false)
                            }
                        }}
                    >
                        {proposals.map((proposal) => (
                            <div key={proposal.proposalId} className="card">
                                <h5>{proposal.description}</h5>
                                <div>
                                    {proposal.votes.map(({ type, label }) => {
                                        const translations = {
                                            Against: "Contra",
                                            For: "A favor",
                                            Abstain: "Abstenção",
                                        }
                                        return (
                                            <div key={type} className='vote-type'>
                                                <input
                                                    type="radio"
                                                    id={proposal.proposalId + "-" + type}
                                                    name={proposal.proposalId}
                                                    value={type}
                                                    //valor padrão "abster" vem habilitado
                                                    defaultChecked={type === 2}
                                                />
                                                <label htmlFor={proposal.proposalId + "-" + type}>
                                                    {translations[label]}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        <button disabled={isVoting || hasVoted} type="submit" className="btn-main btn-vote">
                            {isVoting
                                ? "Votando..."
                                : hasVoted
                                    ? "Você já votou"
                                    : "Submeter votos"}
                        </button>
                        {!hasVoted && (
                            <small>
                                Aviso: Isso irá submeter várias transações que você precisará assinar.
                            </small>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
