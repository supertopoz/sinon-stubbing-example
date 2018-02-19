// Sinon *Mock* Example with Mocha and Chai v2

// *************** App *****************************


// ***** API ************
 
const getData = (locale) => {
  let url = '/GetLocalPressReleases'
  if(locale === 'global') url = '/GetGlobalPressReleases';
  return new Promise((resolve, reject) => {
    axios.get(url).then((data) =>{
      resolve(data)
    })
    .catch((error) => {
      reject(error)
    }) 
  })
}


// ****** main class ***************

class createCards {
  constructor(){
    this.result = [];
  }
  
  formatData(){
    getData('local').then(data => {       
      
      this.formatLocale(data, 'local')    
      getData('global').then(data => {      
        this.formatLocale(data, 'global')    
        this.result = this.sortData(result)
      })        
    })
  }
  formatLocale(data, source){
    data.forEach(item => {
      item.source = source;
      this.result.push(item)
    })
  return;
  }
  sortData(data){
    return data.sort((a,b) => a.timestamp - b.timestamp);
  }
  createCard(data){
    return new Promise ((resolve, reject) => {
      const timestamp = moment.unix(data.timestamp).utc().format('DD/MM/YYYY hh:mm:ss');     
      const card =(`<div class="card">`+
            `<a class="header" href="${ data.link}" target="_blank">${data.headline}</a>`+   
            `<p> ${timestamp}</p>`+
            `<img src="${ data.authorImageUrl}" alt="authors-image"/>`+
            `<p>${ data.authorName }</p>`+
            `</div>`)
      $('#display-news').append(card)
      resolve(card)    
    })
  }
  addNewsStream(data){
    return new Promise((resolve,reject) => {
    const promises = [];
    data.forEach(item => {
       promises.push(this.createCard(item));        
    })
    Promise.all(promises).then((result)=>{       
       resolve(result)       
    })
    })
   }
}  // end of class


const stream = new createCards();

$(document).ready(() => {
 // Un-comment when ready to use live data.
/*   getData('local').then(data => {
    stream.formatLocale(data, 'local')
    getData('global').then(data => {
      stream.formatLocale(data, 'global');
      const sortedData = stream.sortData(stream.result)
      stream.addNewsStream(sortedData)
    })
  }) */
})
  
  


// *************** TESTS ****************************

let assert = chai.assert
let expect = chai.expect

mocha.setup('bdd');

window.onload = function() {
    mocha.run();
};

const cardBuilder = new createCards()

describe('Test runner!', () => {
  describe('Handle incoming data!', () => {
    let sandbox;
    beforeEach(() => sandbox = sinon.sandbox.create());
    afterEach(() => sandbox.restore());
    
    it('should call an end point', () => {
      const xData = [{
        "something": "one"
      }, {
        "something": "two"
      }]
      const resolved = new Promise((resolve) => resolve(xData))
      sandbox.stub(axios, 'get').returns(resolved);
      getData().then(data => {
        expect(data).to.deep.equal(xData)
      })
    })
    
    it('should switch between end points and add location as a field', () => {
      const resolvedFirst = new Promise((resolve) => resolve(localData));
      sandbox.stub(axios, 'get').returns(resolvedFirst);
      getData('local').then(data => {
        cardBuilder.formatLocale(data, 'local')
        const resolvedSecond = new Promise((resolve) => resolve(globalData));
        sandbox.stub(axios, 'get').returns(resolvedSecond);
        getData('global').then(data => {
          cardBuilder.formatLocale(data, 'global')
          expect(cardBuilder.result).to.deep.equal(combinedData)
        })
      })
    })
    
    it('should put all the data in an array in order of time', () => {
      const unsortedData = [{ 
        timestamp: 12
      }, {
        timestamp: 13
      }, {
        timestamp: 11
      }]
      const sortedData = [{
        timestamp: 11
      }, {
        timestamp: 12
      }, {
        timestamp: 13
      }]
      expect(cardBuilder.sortData(unsortedData)).to.deep.equal(sortedData)
    })
  })
  describe('Add data to DOM!', () => {
    it.skip('should make one card template to hold news data', () => {
       const data = localData[0];
       const timestamp = moment.unix(data.timestamp).utc().format('DD/MM/YYYY hh:mm:ss');       
       const card = (`<div class="card">`+
                     `<a class="header" href="${ data.link}" target="_blank">`+
                     `${data.headline}`+
                     `</a>`+
                     `<p> ${timestamp}</p>`+
                     `<img src="${ data.authorImageUrl}" alt="authors-image"/>`+
                     `<p>${ data.authorName }</p>`+
                     `</div>`)
       cardBuilder.createCard(data).then((res)=>{         
         expect(res).to.deep.equal(card);
       })     
    })
    
    it('should add data to the DOM in cards', () => {
       const dataLength = combinedData.length;
       const data = cardBuilder.sortData(combinedData);
       cardBuilder.addNewsStream(data).then(result => {
         expect(result.length).to.equal(dataLength)
       })         
    })
  })
});


// ***************** Example Data *******************************************

const localData = [
      {
        "timestamp": 150892600,
        "headline": "New version of the product.",
        "link": "http://example.url/new_version",
        "authorName": "Paul Abbot",
        "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg"
      },
        
      {
        "timestamp": 150892700, 
        "headline": "Even newer version of the product announced.",
        "link": "http://example.url/new_version",
        "authorName": "Bob Smith",
        "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg"
      }
      ]
const globalData = [
      {
       "timestamp": 1519012606,
       "headline": "New version of the product announced again.",
       "link": "http://example.url/new_version",
       "authorName": "Carly Walker",
       "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg"
      
      },
      {
       "timestamp": 1519012974,
       "headline": "Even newer version of the product announced one last time.",
       "link": "http://example.url/new_version",
       "authorName": "Steve Harginton",
       "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg"
      }
    ]
const combinedData = [
      {
       "timestamp": 150892600,
       "headline": "New version of the product.",
       "link": "http://example.url/new_version",
       "authorName": "Paul Abbot",
       "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg",
       "source": "local"
      },  
      {
      "timestamp": 150892700, 
      "headline": "Even newer version of the product announced.",
      "link": "http://example.url/new_version",
      "authorName": "Bob Smith",
      "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg",
      "source": "local"
      },
       {
       "timestamp": 1519012606,
       "headline": "New version of the product announced again.",
       "link": "http://example.url/new_version",
       "authorName": "Carly Walker",
       "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg",
       "source": "global"
      },
      {
      "timestamp": 1519012974,
      "headline": "Even newer version of the product announced one last time.",
      "link": "http://example.url/new_version",
      "authorName": "Steve Harginton",
      "authorImageUrl": "http://www.postavy.cz/foto/homer-jay-simpson-foto.jpg",
      "source": "global"
      }      
    ]