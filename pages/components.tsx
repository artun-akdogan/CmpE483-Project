import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import React,{ forwardRef } from 'react'
import { Card, Button, Space, InputNumber, Input } from 'antd'

export function FeatureCard (props: any) {
    return (
        <Card title={props.title} bordered={false} style={{ width: 450, marginLeft: 50, marginBottom: "20px" }}>
            {props.children}
            <Space direction="vertical" style={{ width: '100%' }}>
                <Button onClick={props.buttonFunction} style={{backgroundColor: '#1A1A40', position:'relative', top:'10px'}} type="primary" block >
                    {props.buttonTitle}
                </Button>
            </Space>
        </Card>
    )
}

export function InputNum (props: any) {
    return (
        <InputNumber onChange={(value:number|null) => props.function(value)} placeholder={props.title} style={{ width: '100%' }} />
    )
}

export function InputStr (props: any) {
    return (
        <Input onChange={(e) => props.function(e.target.value)} placeholder={props.title} style={{ width: '100%' }} />
    )
}

export function RadioBoolean (props: any) {
    const func = (event: any) => {
        props.function(event.target.value==="true")
    }
    return (
        <div className="radio-group" style={{marginTop: "7px", marginBottom: "3px"}}>
            <label style={{fontSize: "1rem", marginRight: '1rem', fontWeight: 'bold'}}>{props.label}: </label>
            <label className="radio-label" style={{fontSize: "1rem", cursor: 'pointer', marginRight: '1rem'}} >
                <input className="radio-input" type="radio" value="true" checked={props.value === true} onChange={func} style={{cursor: 'pointer'}} /> Yes </label>
            <label className="radio-label" style={{fontSize: "1rem", cursor: 'pointer'}} >
                <input className="radio-input" type="radio" value="false" checked={props.value === false} onChange={func} style={{cursor: 'pointer'}} /> No </label>
        </div>
    )
}

export function DateInput (props: any) {
        const CustomInput = forwardRef(({ value, onClick }, ref) => (
            <Input onClick={onClick} value={value} />
        ));
        if(props.placeholder){
            return(
                <div style={{ width: props.width }}>
                    <DatePicker selected={props.value} onChange={props.function} placeholderText={props.title} showTimeSelect customInput={<CustomInput />} />
                </div>
            )
        }else{
            return(
                <label style={{fontWeight: 'bold', display: "flex", fontSize:"1.2rem", width: props.width}}>{props.title}:
                <div style={{width: "100%", display: "flex", marginLeft: "1rem"}}>
                     <DatePicker selected={props.value} onChange={props.function} placeholderText={props.title} showTimeSelect customInput={<CustomInput />} />
                </div>
                </label>
            )
        }
}

export function DynamicForm2 (props: any) {
    const prototype = { amount: null, schedule: new Date() }
  
    const handleFormChange = (name:string, value:number|Date|null, index: number) => {
      let data = [...props.formFields];
      data[index][name] = value;
      props.setFormFields(data);
    }

    const addFields = () => {
      props.setFormFields([...props.formFields, prototype])
    }

    const removeFields = (index: number) => {
        let data = [...props.formFields];
        data.splice(index, 1)
        props.setFormFields(data)
    }

    return (
      <div>
          {props.formFields.map((form, index) => {
            return (
              <div key={index} style={{ display: "flex" }}>
                <InputNumber onChange={(value:number|null) => handleFormChange("amount", value, index)} placeholder='Amount' value={form.amount} style={{ width: '45%' }} />
                <DateInput value={props.formFields[index]['schedule']} function={(date: Date) => handleFormChange("schedule", date, index)} title="Schedule" width="%45" placeholder={true}/>
                <Button onClick={() => removeFields(index)} style={{ width: '10%' }} >-</Button>
              </div>
            )
          })}
        <Button onClick={addFields}>Add Amount/Schedule</Button>
      </div>
    );
  }

  export function DynamicForm1 (props: any) {
    const prototype = { choices: "" }
  
    const handleFormChange = (name:string, value:number|Date|null, index: number) => {
      let data = [...props.formFields];
      data[index][name] = value;
      props.setFormFields(data);
    }
  
    const addFields = () => {
      props.setFormFields([...props.formFields, prototype])
    }

    const removeFields = (index: number) => {
        let data = [...props.formFields];
        data.splice(index, 1)
        props.setFormFields(data)
    }

    return (
        <div>
            {props.formFields.map((form, index) => {
              return (
                <div key={index} style={{ display: "flex" }}>
                  <InputNumber onChange={(value:number|null) => handleFormChange("choices", value, index)} placeholder='Choice' value={form.choices} style={{ width: '90%' }} />
                  <Button onClick={() => removeFields(index)} style={{ width: '10%' }} >-</Button>
                </div>
              )
            })}
          <Button onClick={addFields}>Add Amount/Schedule</Button>
        </div>
    );
}
