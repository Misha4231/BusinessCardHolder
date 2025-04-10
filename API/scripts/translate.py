from deep_translator import GoogleTranslator
import json

languagesToTranslate = ['uk','ru','pl',"cs","da","fr","de"]

enTranslationFile = open('en.json')
enData = json.load(enTranslationFile)

for language in languagesToTranslate:
    translatedData = {}
    
    for key, toTranslate in enData.items():
        translatedData[key] = GoogleTranslator(source='auto', target=language).translate(toTranslate)
        
    with open(f'output/{language}.json', 'w', encoding='utf-8') as f:
        json.dump(translatedData, f, indent=4, ensure_ascii=False)