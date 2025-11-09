import React ,{useState} from "react";



const Register = () =>
{
    const [count , setCount] = useState(0)

    const increase = () =>{
        setCount(count+1);
    }
    const decrease = () =>{
        if(count > 0){
            setCount(count-1);
        }
        else{
            setCount(0)
        }
      
    }
        return(
            <>
            <center>
            <h1>Counter Application</h1>
            <h1>Count Value : {count}</h1>
            <button class="btn btn-success navbar-btn" onClick={increase}>Increase</button>&nbsp;&nbsp;&nbsp;
            <button class="btn btn-danger navbar-btn" onClick={decrease}>Decrease</button><br />
            </center>
            </>
        );
}
 
export default Register;