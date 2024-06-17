import '../index.css'
import { FiSettings, FiUsers, FiLogOut, FiFileText, FiTool, FiCheckSquare, FiUser, FiDatabase, FiType, FiTag, FiList } from 'react-icons/fi'
import { AuthContext } from '../context/auth'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import avatar from '../images/avatar.png'


export default function Sidebar() {

    const { user, signOut } = useContext(AuthContext)

    function handleLink() {
        document.querySelector('.side-link').classList.toggle('menu-selected')
    }



    return (
        <div className='sidebar'>
            <div className='avatar'>
                <img src={user.avatar === null ? avatar : user.avatar} />
            </div>

            <div className="links">
                <Link className='side-link' id='settings' to='/profile' onFocus={handleLink}>
                    <FiUser />
                    Perfil
                </Link>
                <Link className='side-link' to='/dashboard'>
                    <FiTool />
                    Chamados
                </Link>
                <Link className='side-link' to='/completedtasks'>
                    <FiCheckSquare />
                    Chamados Concluidos
                </Link>
                {user.group === "admin" ? 
                    <>
                        <Link className='side-link' onClick={() => document.querySelector('.class').classList.toggle('setting-options-show')} id='settings' to=''>
                            <FiSettings />
                            Configurações
                        </Link>
                        <div className='setting-options class'>
                            <Link to='/clients'>
                                <FiUsers />
                                Unidades
                            </Link>
                            <Link className='side-link' to='/reports'>
                                <FiFileText />
                                Relatorios
                            </Link>
                            <Link className='side-link' to='/tasktypes'>
                                <FiType />
                                Tipo
                            </Link>
                            <Link className='side-link' to='/subjects'>
                                <FiTag />
                                Assuntos
                            </Link>
                            <Link className='side-link' to='/status'>
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