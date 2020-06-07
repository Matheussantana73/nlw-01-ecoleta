/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft} from "react-icons/fi";
import { Link, useHistory } from 'react-router-dom';

import { Map, TileLayer, Marker, } from "react-leaflet";

import './style.css'

import Logo from '../../assets/logo.svg'
import api from '../../service/api';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

interface interfaceItems {
  id: number,
  title: string,
  url_image: string,
}

interface IBGEUFResponse {
  sigla: string
}

interface IBGECITYResponse {
  nome: string
}

const CreatePoint = () =>{
  const [items, setItems] = useState<interfaceItems[]>([]);
  const [ufs, setUf] = useState<string[]>([]);
  const [cities, setCeties] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState<string>("0");
  const [selectedCity, setSelectedCity] = useState<string>("0");

  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
  const [initialposition, setInitialposition] = useState<[number,number]>([0,0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [ formData, setFormData] = useState({
    name:'',
    email:'',
    whatsapp:'',
  });

  const history = useHistory();

  useEffect(()=>{
    api.get('items').then(res => {
      setItems(res.data);
    });
  }, []);
  
  useEffect(()=>{
    api.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res =>{
      const ufInitials = res.data.map(uf => uf.sigla);
      setUf(ufInitials);
    });
  }, []);

  useEffect(()=>{
    api.get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res =>{
      const cityNames = res.data.map(city => city.nome);
      setCeties(cityNames);
    });
  }, [selectedUf]);

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude , longitude} = position.coords;
      setInitialposition([latitude,longitude]);
    });
  }, []);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }
  function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event:LeafletMouseEvent){
    const {lat, lng} = event.latlng;
    setSelectedPosition([lat,lng]);
  }

  function handleInputChange(event:ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;
    setFormData({...formData, [name]: value});
  }

  function handleSelectItem(id:number){
    const indexId = selectedItems.findIndex(item => item === id);
    if (indexId > -1) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function onSubmit(event:FormEvent) {
    event.preventDefault();

    const {name,email,whatsapp} = formData;
    const [latitude, longitude] = selectedPosition;
    const uf = selectedUf;
    const city = selectedCity;
    const items = selectedItems;

    const data = new FormData();

    
      data.append('name', name);
      data.append('email', email);
      data.append('whatsapp', whatsapp);
      data.append('latitude', String(latitude));
      data.append('longitude', String(longitude));
      data.append('uf', uf);
      data.append('city', city);
      data.append('items', items.join(','));

      if (selectedFile) {
        data.append('image', selectedFile);
      }
    
    await api.post('points', data);
    alert('Ponto de coleta cadastrado');
    history.push('/');
  }

  return(
    <div id="page-create-point">
    <header>
      <img src={Logo} alt="Ecoleta"/>
      <Link to="/">
        <FiArrowLeft/>
        Voltar para Home
      </Link>
    </header>

    <form onSubmit={onSubmit}>
      <h1>Cadsatro do ponto de coleta</h1>

      <Dropzone onFileUploaded={setSelectedFile} />

      <fieldset>
        <legend>
          <h2>Dados</h2>
        </legend>

        <div className="field">
          <label htmlFor="name">Nome da entidade</label>
          <input
            type="text"
            name="name"
            id="name"
            onChange={handleInputChange}
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}

            />
          </div>
          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}

            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <h2>Endereço</h2>
          <span>Selecione o endereço no mapa</span>
        </legend>

          <Map center={initialposition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
              <Marker position={selectedPosition}></Marker>
          </Map>

        <div className="field-group">
          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select value={selectedUf} name="uf" id="uf" onChange={handleSelectUf}>
              <option value="0">Selecione um UF</option>
              {
                ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  )
                )
              }
            </select>
          </div>
          <div className="field">
            <label htmlFor="city">Cidade</label>
           <select value={selectedCity} name="city" id="city" onChange={handleSelectCity}>
              <option value="0">Selecione uma Cidade</option>
              {
                cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))
              }
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <h2>Ítens de coleta</h2>
          <span>Selecione uma ou mais ítens abaixo</span>
        </legend>

        <ul className="items-grid">
          {items.map(item => (
            <li className={selectedItems.includes(item.id) ? 'selected': ''} key={item.id} onClick={() => handleSelectItem(item.id)}>
              <img src={item.url_image} alt={item.title} />
              <span>{item.title}</span>
            </li>
          ))}
            
        </ul>

        <button type="submit">
          Cadastrar pondto de coleta
        </button>
      </fieldset>
    </form>
    </div>
  )
}

export default CreatePoint;