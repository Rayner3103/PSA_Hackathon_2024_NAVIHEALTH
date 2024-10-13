import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ThreeModel from "./Model";
import PopoverComponent from "./PopoverComponent";
import { Typography } from "@mui/material";

export default function Record() {

  const [open, setOpen] = useState(false)
  const [prediction, setPrediction] = useState(null)

  useEffect(() => {
    if (open) {
      predict_repair_date({input: [25, 633]})
    }
  }, [open])
    
  const predict_repair_date = async (input) => {

      let data = "nochange"
      
      try {
        const response = await fetch('http://localhost:5050/regression/', {
          method: 'POST',          
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        })
        
        if (response) {
          data = await response.json()
          setPrediction(data)
        }
        
      } catch (error){
        console.log(error)
      }
    }

  return (
    <div className="flex flex-row">
      <div>
        <ThreeModel camera={{ fov: 64, position: [0, 20, 100] }} setOpen={setOpen}/>
      </div>

      <div>
        <Typography sx={{ px: 2, pt:2, fontWeight: 900, fontSize: "h5.fontSize" }} color="error">WARNING: </Typography>
        <Typography sx={{ px: 2, pb:2, fontWeight: 700, fontSize: "subtitle2.fontSize" }} color="warning">The component(s) below is faulty, please inspect.</Typography>
        <Typography sx={{ px: 2, fontWeight: 700, fontSize: "subtitle.fontSize" }}>AGV-3345 Front Tyre</Typography>
      </div>

      <PopoverComponent open={open} setOpen={setOpen} prediction={prediction} />
    </div>
  );
}