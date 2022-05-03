let store = {
    user: { name: "Anna" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    data: '',
    isLoading: true,
    selected: ''
}
// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    let { apod, user } = state

    return `
        <header></header>
        <main>
            ${greeting(user.name)}
            <section>
                ${imageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}

const generateRoverHtml = (roverId) => {
    const roverPhotos = store[roverId].response.photos
    const roverData = roverPhotos[0].rover
    const {
        launch_date,
        landing_date,
        status,
    } = roverData

    // dont know where to get date of creation
    const latest_date = roverPhotos.reduce((a, b) => {
        return new Date(a.earth_date) > new Date(b.earth_date) ? a : b;
    });

    return (store[roverId]) ?
        `
            <p>ROVER NAME: ${roverId}</p>
            <p>Launch Date: ${launch_date}</p>
            <p>Landing Date: ${landing_date}</p>
            <p>Status: ${status}</p>
            <p>Most recently available photos</p>
            <p>${generateRoverPhotos(roverPhotos)}</p>
        `
        :
        `Unable to load data from rover ${roverId}`
}

const generateRoverPhotos = (roverPhotos) => {
    return roverPhotos.map((photo) => `<img src='${photo.img_src}' width='150' />`)
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

store.rovers.map((rover) => {
    document.getElementById(`rover-${rover}`).addEventListener('click', (event) => {
        event.preventDefault()
        displayRoverWithId(rover)
    });
})


// ------------------------------------------------------  COMPONENTS

const greeting = (name) => `<h1>Welcome${name ? `, ${name}` : ''}!</h1>`

const imageOfTheDay = (apod) => {
    const {
        isLoading
    } = store;
    const today = new Date()

    if (!apod || apod.image?.date === today.getDate() ) {
        getImageOfTheDay(store)
        const newState = {
            ...store,
            isLoading: false
        }
        Object.assign(store, newState)
    }

    if(!isLoading) {
        const apodImage = apod.image;
        const {
            explanation,
            hdurl,
            media_type,
            title
        } = apodImage;

        return (media_type === "video") ? (`
            <p>See today's featured video <a href="${hdurl}">here</a></p>
            <p>${title}</p>
            <p>${explanation}</p>
        `) : (`
            <img src="${hdurl}" width="300px" />
            <p>${explanation}</p>
        `)
    } else {
        return ''
    }
}

const displayRoverWithId = (roverId) => {
    let roverHtml = `Loading ${roverId}`
    if(!store[roverId]) {
        getImageOfTheDayRover(roverId, store)
            .then(() => {
                roverHtml = generateRoverHtml(roverId)
                root.innerHTML = roverHtml
            })
            .catch((err) => console.log('getImageOfTheDayRover error: ', err))
    } else {
        roverHtml = generateRoverHtml(roverId)
        root.innerHTML = roverHtml
    }
}

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = () => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
        .catch((err) => console.log(err));
}

const getImageOfTheDayRover = (rover, state) => {
    return fetch(`/showRover/${rover.toLowerCase()}`)
        .then(res => res.json())
        .then(data => updateStoreRover(state, {[rover]:  data }))
        .catch((err) => console.log('getImageOfTheDayRover: ', err))
}

const updateStoreRover = (state, newState) => {
    store = Object.assign(state, newState)
}
