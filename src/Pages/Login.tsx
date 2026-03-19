import DetailsBox from "../Components/DetailsBox";
import './Login.css';


interface loginProps {
    hasAccount: boolean,
    setHasAccount: React.Dispatch<React.SetStateAction<boolean>>,
}

function Login({hasAccount, setHasAccount}: loginProps) {
    return (
        <div className='login'>
            <DetailsBox hasAccount={hasAccount} setHasAccount={setHasAccount} />
        </div>
    )
}

export default Login;