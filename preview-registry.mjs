// Read-only: print candidate additions for the current Black Flag registry.
import {readFile} from 'node:fs/promises';
const path=process.argv[2];
if(!path)throw Error('Usage: node preview-registry.mjs /path/to/FLEET_LEARNING_REGISTRY.json');
const registry=JSON.parse(await readFile(path,'utf8'));
if(registry.schema!=='dark-sky-fleet-learning-registry-v1'||!Array.isArray(registry.learnings))throw Error('Unrecognized registry schema.');
const candidates=JSON.parse(await readFile(new URL('./registry-candidates.json',import.meta.url),'utf8'));
const existing=new Set(registry.learnings.map(rule=>rule.id));
const additions=candidates.filter(rule=>!existing.has(rule.id));
console.log(JSON.stringify({status:'preview',existing_count:existing.size,proposed_count:additions.length,additions},null,2));
