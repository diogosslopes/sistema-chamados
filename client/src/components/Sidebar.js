import '../index.css'
import { FiSettings, FiUsers, FiLogOut, FiFileText, FiTool, FiCheckSquare, FiUser, FiDatabase, FiType, FiTag, FiList } from 'react-icons/fi'
import { AuthContext } from '../context/auth'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import avatar from '../images/avatar.png'


export default function Sidebar() {

    const { user, signOut } = useContext(AuthContext)



    return (
        <div className='sidebar'>
            <div className='avatar'>
                <img src={user.avatar === null ? avatar : user.avatar} />
            </div>

            <div className="links">
                <Link id='settings' to='/profile'>
                    <FiUser />
                    Perfil
                </Link>
                <Link to='/dashboard'>
                    <FiTool />
                    Chamados
                </Link>
                <Link to='/completedtasks'>
                    <FiCheckSquare />
                    Chamados Concluidos
                </Link>
                {user.group === "admin" ?
                    <>
                        <Link onClick={() => document.querySelector('.class').classList.toggle('setting-options-show')} id='settings' to=''>
                            <FiSettings />
                            Configurações
                        </Link>
                        <div className='setting-options class'>
                            <Link to='/clients'>
                                <FiUsers />
                                Unidades
                            </Link>
                            <Link to='#'>
                                <FiFileText />
                                Relatorios
                            </Link>
                            <Link to='/tasktypes'>
                                <FiType />
                                Tipo
                            </Link>
                            <Link to='/subjects'>
                                <FiTag />
                                Assuntos
                            </Link>
                            <Link to='/status'>
                                <FiList />
                                Status
                            </Link>
                        </div>

                    </>
                    :
                    <></>
                }
                <a href="" onClick={signOut}><FiLogOut />Sair</a>
            </div>
        </div>
    )
}