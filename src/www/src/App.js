import React, { useState } from 'react';
import './App.css';
import * as axios from 'axios';
import { Button, Grid } from 'semantic-ui-react'

function App() {
  const [hombroPata1, setHombroPata1] = useState(0)
  const handleClick = (pata, motor, direccion) => {
    axios.get(`http://192.168.7.64:3000/move?pata=${pata}&motor=${motor}&direccion=${direccion}`)
      .then(data => {
        console.log(data)
        //setHombroPata1(data.data.posicion)
      })
  }

  const setpos = (pata, motor, posicion) => {
    return axios.get(`http://192.168.7.64:3000/move?pata=${pata}&motor=${motor}&posicion=${posicion}`)
      .then(data => {
        console.log(data)
        //setHombroPata1(data.data.posicion)
      })
  }

  const off = () => {
    axios.get(`http://192.168.7.64:3000/off`);
  }

  const home = () => {
    axios.get(`http://192.168.7.64:3000/home`);
  }
  const pausa = async (tout) => new Promise(resolve => setTimeout(() => resolve(), tout));

  const stepup = async () => {
    setpos(1, 'brazo', 1);
    setpos(2, 'brazo', 1);
    setpos(3, 'brazo', 1);
    setpos(4, 'brazo', 1);
    await pausa(1000);
    setpos(1, 'hombro', 0.25);
    setpos(2, 'hombro', 0.75);
    setpos(3, 'hombro', 0.75);
    setpos(4, 'hombro', 0.25);
    await pausa(1000);
    setpos(1, 'antebrazo', 0);
    setpos(2, 'antebrazo', 0);
    setpos(3, 'antebrazo', 0);
    setpos(4, 'antebrazo', 0);
    await pausa(1000);


    setpos(1, 'brazo', 0.75);
    setpos(2, 'brazo', 0.75);
    setpos(3, 'brazo', 0.75);
    setpos(4, 'brazo', 0.75);
    await pausa(1000);

    setpos(2, 'brazo', 0.5);
    setpos(2, 'antebrazo', 1);
    await pausa(1000);
    setpos(2, 'brazo', 0);
    setpos(1, 'brazo', 0.5);
    await pausa(1000);
    setpos(3, 'brazo', 0.5);
    setpos(3, 'antebrazo', 1);
    await pausa(1000);
    setpos(3, 'brazo', 0);
    setpos(4, 'brazo', 0.5);
    await pausa(1000);


    setpos(2, 'brazo', 0.5);
    setpos(2, 'antebrazo', 0);
    await pausa(2000);

    setpos(3, 'brazo', 0.5);
    setpos(3, 'antebrazo', 0);
    await pausa(1000);


    //await pausa(5000);
    //off();
  }


  const sitdown = async () => {
    for(let p=0.5; p<0.8;p+=0.01) {
      setpos(1, 'brazo', p);
      setpos(2, 'brazo', p);
      setpos(3, 'brazo', p);
      setpos(4, 'brazo', p);
      await pausa(500);
    }
    // const p=0.8;
    // setpos(1, 'brazo', p);
    // setpos(2, 'brazo', p);
    // setpos(3, 'brazo', p);
    // setpos(4, 'brazo', p);

    await pausa(2000);
    off();
  }

  return (
    <Grid columns={2} rows={2} divided={true}>

      <Grid.Row>
        <Button onClick={() => off()}>Poweroff all</Button>
        <Button onClick={() => home()}>Home all</Button>
        <Button onClick={() => stepup()}>Step Up</Button>
        <Button onClick={() => sitdown()}>Sit Down</Button>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          Pata 1
          <Grid.Row>
            <Grid.Column>Hombro {hombroPata1} </Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(1, 'hombro', 'l')}>Left</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(1, 'hombro', 'r')}>Right</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Brazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(1, 'brazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(1, 'brazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Antebrazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(1, 'antebrazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(1, 'antebrazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column>
          Pata 3
          <Grid.Row>
            <Grid.Column>Hombro</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(3, 'hombro', 'l')}>Left</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(3, 'hombro', 'r')}>Right</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Brazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(3, 'brazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(3, 'brazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Antebrazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(3, 'antebrazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(3, 'antebrazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          Pata 2
          <Grid.Row>
            <Grid.Column>Hombro</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(2, 'hombro', 'l')}>Left</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(2, 'hombro', 'r')}>Right</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Brazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(2, 'brazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(2, 'brazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Antebrazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(2, 'antebrazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(2, 'antebrazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column>
          Pata 4
          <Grid.Row>
            <Grid.Column>Hombro</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(4, 'hombro', 'l')}>Left</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(4, 'hombro', 'r')}>Right</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Brazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(4, 'brazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(4, 'brazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>Antebrazo</Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(4, 'antebrazo', 'd')}>Down</Button></Grid.Column>
            <Grid.Column><Button onClick={() => handleClick(4, 'antebrazo', 'u')}>Up</Button></Grid.Column>
          </Grid.Row>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default App;
