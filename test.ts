import * as N3 from "n3"
import { Quad } from '@rdfjs/types';
import rdfParser from "rdf-parse";
import evaluatePath from "./index";

const toStream = require('streamify-string')


const tree = {
  path: 'https://w3id.org/tree#path'
}

const sh = {
  path: 'http://www.w3.org/ns/shacl#path',
  inversePath: 'http://www.w3.org/ns/shacl#inversePath',
  alternativePath: 'http://www.w3.org/ns/shacl#alternativePath',
  zeroOrMorePath: 'http://www.w3.org/ns/shacl#zeroOrMorePath',
  oneOrMorePath: 'http://www.w3.org/ns/shacl#oneOrMorePath',
  zeroOrOnePath: 'http://www.w3.org/ns/shacl#zeroOrOnePath',
}
const rdf = {
  type: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  first: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
  rest: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
  nil: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil',
}

const schema = {
  Person: "http://schema.org/Person",
  knows: "http://schema.org/knows",
  spouse: "http://schema.org/spouse",
}


const ex = {
  plus: "http://ex.org/plus",
  min: "http://ex.org/min",
  value: "http://ex.org/value",
}

const nn = (term) => {
  return new N3.NamedNode(term)
}
const bn = (term) => {
  return new N3.BlankNode(term)
}




async function test() {
  
  console.log('-------------------------------Predicate Path Test-------------------------------------')
  let path1 = `
    @prefix tree: <https://w3id.org/tree#> . 
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix ex: <http://ex.org/> .

    _:relation tree:path ex:value .
  `
  console.log(JSON.stringify(
    await testPath(path1)
    , null, 2))

  console.log('-------------------------------Sequence Path Test-------------------------------------')
  let path2 = `
    @prefix tree: <https://w3id.org/tree#> . 
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix ex: <http://ex.org/> .

    _:relation sh:path ( ex:plus ex:plus ex:value ) .
  `
  console.log(JSON.stringify(
    await testPath(path2)
    , null, 2))

  
  console.log('-------------------------------Alternative Path Test-------------------------------------')
  let path3 = `
    @prefix tree: <https://w3id.org/tree#> . 
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix ex: <http://ex.org/> .

    _:relation sh:path ( [ sh:alternativePath (ex:plus ex:min) ] ex:value ) .
  `
  console.log(JSON.stringify(
    await testPath(path3)
    , null, 2))


  
  console.log('-------------------------------Inverse Path Test-------------------------------------')
  let path4 = `
    @prefix tree: <https://w3id.org/tree#> . 
    @prefix sh: <http://www.w3.org/ns/shacl#> .
    @prefix ex: <http://ex.org/> .

    _:relation sh:path ( [ sh:inversePath (ex:plus ex:plus) ] ex:value ) .
  `
  console.log(JSON.stringify(
    await testPath(path4)
    , null, 2))


}

async function testPath(pathString) {

  let id = nn("http://ex.org/5")
  
  const dataString = `
    @prefix ex: <http://ex.org/> .

    ex:0 ex:value "0" .
    ex:1 ex:value "1" .
    ex:2 ex:value "2" .
    ex:3 ex:value "3" .
    ex:4 ex:value "4" .
    ex:5 ex:value "5" .
    ex:6 ex:value "6" .
    ex:7 ex:value "7" .
    ex:8 ex:value "8" .
    ex:9 ex:value "9" .

    ex:0 ex:plus ex:1 .
    ex:1 ex:plus ex:2 .
    ex:2 ex:plus ex:3 .
    ex:3 ex:plus ex:4 .
    ex:4 ex:plus ex:5 .
    ex:5 ex:plus ex:6 .
    ex:6 ex:plus ex:7 .
    ex:7 ex:plus ex:8 .
    ex:8 ex:plus ex:9 .
    
    ex:1 ex:min ex:0 .
    ex:2 ex:min ex:1 .
    ex:3 ex:min ex:2 .
    ex:4 ex:min ex:3 .
    ex:5 ex:min ex:4 .
    ex:6 ex:min ex:5 .
    ex:7 ex:min ex:6 .
    ex:8 ex:min ex:7 .
    ex:9 ex:min ex:8 .
  `;

  
  const dataQuads : Quad[] = await new Promise((resolve, reject) => {
    let quads : Quad[] = []

    rdfParser.parse(toStream(dataString), { contentType: 'text/turtle', baseIRI: 'http://example.org' })
    .on('data', (quad) => quads.push(quad))
    .on('error', (error) => reject(error))
    .on('end', () => resolve(quads));
  })

  const pathQuads : Quad[] = await new Promise((resolve, reject) => {
    let quads : Quad[] = []

    rdfParser.parse(toStream(pathString), { contentType: 'text/turtle', baseIRI: 'http://example.org' })
    .on('data', (quad) => quads.push(quad))
    .on('error', (error) => reject(error))
    .on('end', () => resolve(quads));
  })

  return evaluatePath(dataQuads, pathQuads, id, null) 
}

test();
