import { useRef } from "react";

interface WheelPickerProps {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}


function WheelPicker({
  values,
  value,
  onChange,
  suffix,
}: WheelPickerProps) {


  const startY =
    useRef(0);

  const startIndex =
    useRef(0);

  const dragging =
    useRef(false);


  const itemHeight = 50;



  function startDrag(y:number) {

    dragging.current = true;

    startY.current = y;

    startIndex.current =
      values.indexOf(value);

  }



  function moveDrag(y:number) {

    if (!dragging.current)
      return;


    const distance =
      startY.current - y;


    const steps =
      Math.round(
        distance / itemHeight
      );


    let index =
      startIndex.current + steps;


    index =
      Math.max(
        0,
        Math.min(
          values.length - 1,
          index
        )
      );


    onChange(
      values[index]
    );

  }



  function stopDrag(){

    dragging.current = false;

  }



  const selectedIndex =
    values.indexOf(value);



  const offset =
    55 - (selectedIndex * itemHeight);



  return (

    <div

      className="wheelPicker"

      onMouseDown={(e)=>{
        e.preventDefault();
        startDrag(e.clientY);
      }}

      onMouseMove={(e)=>{
        if(dragging.current){
          e.preventDefault();
          moveDrag(e.clientY);
        }
      }}

      onMouseUp={stopDrag}

      onMouseLeave={stopDrag}



      onTouchStart={(e)=>
        startDrag(
          e.touches[0].clientY
        )
      }

      onTouchMove={(e)=>{
        e.preventDefault();
        moveDrag(
          e.touches[0].clientY
        );
      }}

      onTouchEnd={stopDrag}

    >



      <div className="wheelFade top" />


      <div className="wheelSelection" />



      <div

        className="wheelList"

        style={{
          transform:
            `translateY(${offset}px)`
        }}

      >

        {
          values.map((item)=>(

            <div

              key={item}

              className={
                item === value
                ? "wheelItem selected"
                : "wheelItem"
              }

              onClick={()=>
                onChange(item)
              }

            >

              {item}

              {
                suffix &&
                ` ${suffix}`
              }

            </div>

          ))
        }


      </div>



      <div className="wheelFade bottom" />


    </div>

  );

}


export default WheelPicker;