import React from "react";

const Student = (props) => {
   //const{ name,rollno ,enroll,s1,s2,s3 } = props;
  const res = props.student.s1 ;
 console.log(res)

 
  return (
    <>

      
      <table border='1'>
        <thead>
          <tr>
            <th>Name</th>
            <th>rollno</th>
            <th>enroll</th>
            <th>s1</th>
            <th>s2</th>
            <th>s3</th>
            <th>Total</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {
          props.student.map(({ name, rollno, enroll, s1, s2, s3 }) =>{
           
           const  result = s1+s2+s3 > 100 ? "pass" : "fail";


           return(
            <tr className={result}>
              <td>{name}</td>
              <td>{rollno}</td>
              <td>{enroll}</td>
              <td>{s1}</td>
              <td>{s2}</td>
              <td>{s3}</td>
              <td>{s1+s2+s3}</td>
              <td>{result}</td>
            </tr>
          )
})}
        </tbody>
      </table>
    </>
  );
};

export default Student;
