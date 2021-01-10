import React, { useState } from 'react';
import './App.css';
import * as axios from 'axios';
import { Container, Row, Col, Button, Form } from 'react-bootstrap'

function App() {
  const [hombroPata1, setHombroPata1] = useState(0)
  const handleClick = (pata, motor, direccion) => {
    axios.get(`http://192.168.7.64:3000/move?pata=${pata}&motor=${motor}&direccion=${direccion}`)
      .then(data => {
        console.log(data)
        //setHombroPata1(data.data.posicion)
      })
  }

  const shutdown = () => {
    axios.get(`http://192.168.7.64:3000/shutdown`)
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


//    setpos(1, 'hombro', 0.5);
//    setpos(2, 'hombro', 0.5);
//    setpos(3, 'hombro', 0.5);
//    setpos(4, 'hombro', 0.5);
//    await pausa(1000);

//    setpos(1, 'brazo', 0.65);
//    setpos(2, 'brazo', 0.65);
//    await pausa(1000);
//    setpos(3, 'brazo', 0.65);
//    setpos(4, 'brazo', 0.65);
//    await pausa(1000);

    /*    setpos(2, 'brazo', 0.5);
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
    */

    //await pausa(5000);
    //off();
  }


  const sitdown = async () => {
    for (let p = 0.5; p < 0.8; p += 0.01) {
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


  const center = async () => {
    for (let p = 1; p <= 6; p++) {
      setpos(p, 'hombro', 0.5);
      setpos(p, 'brazo', 0.5);
      setpos(p, 'antebrazo', 0.5);
      await pausa(500);
    }
    off();
  }

  const cambia = async (value, pata, motor) => {
    console.log(value, pata, motor);
  }
  return (
    <Container columns={2} rows={2}>
      <Row>
        <Button onClick={() => off()}>Poweroff all</Button>
        <Button onClick={() => home()}>Home all</Button>
        <Button onClick={() => stepup()}>Step Up</Button>
        <Button onClick={() => sitdown()}>Sit Down</Button>
        <Button onClick={() => center()}>Center and Off</Button>
        <Button onClick={() => shutdown()}>Shutdown system</Button>
      </Row>
      <Row>
        <Col>
          Pata 1
          <Row>
            <Col>
              <Form>
                <Form.Group>
                  <Form.Label>Hombro</Form.Label>
                  <Form.Control type={'range'} min={0} max={100}
                                onChange={e => setpos(1, 'hombro', Number(e.target.value) / 100)}/>
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form>
                <Form.Group>
                  <Form.Label>Brazo</Form.Label>
                  <Form.Control type={'range'} min={0} max={100}
                                onChange={e => setpos(1, 'brazo', Number(e.target.value) / 100)}/>
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form>
                <Form.Group>
                  <Form.Label>Antebrazo</Form.Label>
                  <Form.Control type={'range'} min={0} max={100}
                                onChange={e => setpos(1, 'antebrazo', Number(e.target.value) / 100)}/>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        </Col>
        <Col>
          Pata 3
          <Row>
            <Col>Hombro</Col>
            <Col><Button onClick={() => handleClick(3, 'hombro', 'l')}>Left</Button></Col>
            <Col><Button onClick={() => handleClick(3, 'hombro', 'r')}>Right</Button></Col>
          </Row>
          <Row>
            <Col>Brazo</Col>
            <Col><Button onClick={() => handleClick(3, 'brazo', 'd')}>Down</Button></Col>
            <Col><Button onClick={() => handleClick(3, 'brazo', 'u')}>Up</Button></Col>
          </Row>
          <Row>
            <Col>Antebrazo</Col>
            <Col><Button onClick={() => handleClick(3, 'antebrazo', 'd')}>Down</Button></Col>
            <Col><Button onClick={() => handleClick(3, 'antebrazo', 'u')}>Up</Button></Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          Pata 2
          <Row>
            <Col>Hombro</Col>
            <Col><Button onClick={() => handleClick(2, 'hombro', 'l')}>Left</Button></Col>
            <Col><Button onClick={() => handleClick(2, 'hombro', 'r')}>Right</Button></Col>
          </Row>
          <Row>
            <Col>Brazo</Col>
            <Col><Button onClick={() => handleClick(2, 'brazo', 'd')}>Down</Button></Col>
            <Col><Button onClick={() => handleClick(2, 'brazo', 'u')}>Up</Button></Col>
          </Row>
          <Row>
            <Col>Antebrazo</Col>
            <Col><Button onClick={() => handleClick(2, 'antebrazo', 'd')}>Down</Button></Col>
            <Col><Button onClick={() => handleClick(2, 'antebrazo', 'u')}>Up</Button></Col>
          </Row>
        </Col>
        <Col>
          Pata 4
          <Row>
            <Col>Hombro</Col>
            <Col><Button onClick={() => handleClick(4, 'hombro', 'l')}>Left</Button></Col>
            <Col><Button onClick={() => handleClick(4, 'hombro', 'r')}>Right</Button></Col>
          </Row>
          <Row>
            <Col>Brazo</Col>
            <Col><Button onClick={() => handleClick(4, 'brazo', 'd')}>Down</Button></Col>
            <Col><Button onClick={() => handleClick(4, 'brazo', 'u')}>Up</Button></Col>
          </Row>
          <Row>
            <Col>Antebrazo</Col>
            <Col><Button onClick={() => handleClick(4, 'antebrazo', 'd')}>Down</Button></Col>
            <Col><Button onClick={() => handleClick(4, 'antebrazo', 'u')}>Up</Button></Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
