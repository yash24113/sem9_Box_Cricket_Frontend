import React ,{useState} from "react";



const Calculator = () =>
{
    const [count , setCount] = useState(0)
    const [value , setValue] = useState(0)
    const add = () =>{
        setCount(count+value);
    }
    const minus = () =>{
        if(count > 0){
            setCount(count-value);
        }
        else{
            setCount(0)
        }
    }
    const multi = () =>{
        setCount(count*value);
    }
    const divi = () =>{
        let res = count/value;
        if(count  <  value){
            setCount(0)
        }
        else{
            // if(res > 0){
                
                setCount(res);
                    
            // }
            // else{
            //     setCount(0)
            // }
        }
        
        
    }
    const incrementByValue = () =>{
     
        setValue(value+1)
    }
    const reset =() =>{
        setCount(0)
        setValue(0)
    }
        return(
            <>
            <center>
            <h1>Counter Application</h1>
            <h1>Count  : {count}</h1>
            <h1>Set Value  : {value}</h1>
            <button class="btn btn-success navbar-btn" onClick={incrementByValue}>Set Value</button>&nbsp;&nbsp;&nbsp;
            <button class="btn btn-success navbar-btn" onClick={add}>+</button>&nbsp;&nbsp;&nbsp;
            <button class="btn btn-success navbar-btn" onClick={minus}>-</button>&nbsp;&nbsp;&nbsp;
            <button class="btn btn-success navbar-btn" onClick={multi}>*</button>&nbsp;&nbsp;&nbsp;
            <button class="btn btn-success navbar-btn" onClick={divi}>/</button><br />
            <button class="btn btn-danger navbar-btn" onClick={reset}>Reset</button><br />
            </center>
            </>
        );
}
 
export default Calculator;