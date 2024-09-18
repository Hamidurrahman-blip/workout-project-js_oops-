'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//alert('hello linked');
class App{
  #map;
  #mapEvent;
  #mapZoomLevel=15;
  #workout=[];
  constructor(){
this._getPosition();
this._getlocalstorage()
form.addEventListener('submit',this._newWorkout.bind(this))
inputType.addEventListener('change',this._toggleSwitch)
  }

  _toggleSwitch(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

  }

  _getPosition(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        position=>{
        this._loadmap(position);
      },
      ()=>{ 
        alert('cannot load you postion')
    })
    }
  }
  _loadmap(position){
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(coords);
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map)

    //this.#map.on('click',this._showForm.bind(this))
    this.#map.on('click',this._showForm.bind(this));
    this.#workout.forEach(workout=>
     this._newWorkoutMarker(workout) )
  }

  _showForm(mapE){
    this.#mapEvent=mapE
    form.classList.remove('hidden')
    inputDistance.focus()

  }
  
  _newWorkout(e){
    e.preventDefault();
    console.log('newworkout function')
    const type=inputType.value;
    const distance=+inputDistance.value;
    const duration=+inputDuration.value;
    const {lat,lng}=this.#mapEvent.latlng;
    let Workout;
    //if cycling
    if(type==='cycling'){
      const elevation=+inputElevation.value

      Workout=new Cycling([lat,lng],distance,duration,elevation);
    }
    if(type==='running')
    {
      const cadence=+inputCadence.value

      Workout= new Running([lat,lng],distance,duration,cadence)
    }

    this.#workout.push(Workout)
    console.log(this.#workout)
    this._newWorkoutMarker(Workout);
    this._renderWorkout(Workout)
    this._setlocalstorage()
    this._hideform()
  }

  _newWorkoutMarker(Workout)
    {
      L.marker(Workout.coords)
      .addTo(this.#map).bindPopup(
        L.popup({
          maxwidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${Workout.type}-popup`,
        })
      ).openPopup().setPopupContent(
        `${Workout.type === 'running' ? '🏃🏽‍♂️' : '🚴🏼'} ${Workout.description}`

      )

    }

    _renderWorkout(workout) {
      let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;
  
      if (workout.type === 'cycling') {
        html += ` <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;
      }
  
      if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
  
      form.insertAdjacentHTML('afterend', html);
    }
_setlocalstorage(){
  localStorage.setItem('Workout',JSON.stringify(this.#workout))
}
_hideform(){
  inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    form.style.display = 'none';  
    form.classList.add('hidden');
}
_getlocalstorage(){
  const data=JSON.parse(localStorage.getItem('Workout'))
  if(!data) return;
  this.#workout=data
  this.#workout.forEach(workout=>this._renderWorkout(workout))
  
}

  }

  //next part afetr filling form

  class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);
  
    constructor(coords,distance,duration){
      this.coords = coords;
      this.distance = distance;
      this.duration = duration;
    }
  
    _setDescription(){
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
        months[this.date.getMonth()]
      } ${this.date.getDate()}`;
      console.log(this.description)
    }
    
    
  }
  
  
  class Running extends Workout{
    type = 'running'
    constructor(coords,distance,duration,cadence){
      super(coords,distance,duration);
      this.cadence = cadence;
      this.calcPace();
      this._setDescription()
    }
  
    calcPace(){
      this.pace = this.distance / this.duration;
      return this.pace
    }
  }
  
  class Cycling extends Workout{
    type = 'cycling'
    constructor(coords,distance,duration,elevationGain){
      super(coords,distance,duration);
      this.elevationGain = elevationGain;
      this.calcSpeed()
      this._setDescription()
    }
  
    calcSpeed(){
      
      this.speed = this.distance / (this.duration/60)
      return this.speed
    }
  }
  

  const app= new App()