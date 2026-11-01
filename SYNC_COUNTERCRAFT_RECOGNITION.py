"""Extract the unchanged Ike photo evidence functions for the standalone customer route."""
from pathlib import Path
import re
NAMES=['ikeRgbToHsv','ikeErodeMask','ikeLargestRectangle','ikeAnalyzePlankPixelsProven','ikeAnalyzePlankPixelsLength','ikeVisualSpeciesEvidence','ikeCombineSpeciesEvidence','ikeLengthEvidenceFromGeometry','ikeCombineLengthEvidence','ikeOrientationEvidence']
def extract(source,name):
    start=source.index('  function '+name+'(')
    next_function=re.search(r'^  (?:async )?function \w+\(',source[start+3:],re.M)
    end=start+3+next_function.start() if next_function else len(source)
    text=source[start:end].rstrip()
    # Function terminator is the final two-space brace before the next declaration.
    return text[:text.rfind('\n  }')+4]
def output():
    source=Path('app.js').read_text()
    return "/* Unchanged Ike recognition kernels. Regenerate with SYNC_COUNTERCRAFT_RECOGNITION.py. */\n(function(g){'use strict';\n"+'\n'.join(extract(source,n) for n in NAMES)+"\nconst api={species:ikeCombineSpeciesEvidence,length:ikeCombineLengthEvidence};\napi.analyze=async function(photo){const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=photo.dataUrl;});if(Math.max(img.width,img.height)/Math.max(1,Math.min(img.width,img.height))>8)return {species:null,length:null,orientation:null};const proven=ikeAnalyzePlankPixelsProven(img),length=ikeAnalyzePlankPixelsLength(img);return {species:ikeVisualSpeciesEvidence(img,proven),length:ikeLengthEvidenceFromGeometry(img,length),orientation:ikeOrientationEvidence(img,proven)};};\ng.CountercraftRecognition=Object.freeze(api);\n})(globalThis);\n"
if __name__=='__main__':Path('countercraft_recognition.js').write_text(output())
