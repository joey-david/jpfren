import json

#open the original json file
with open('jmdict-eng-3.5.0.json') as f:
    data = json.load(f)

extracted_data = []

for word in data['words']:
    extracted_data.append({
        "i": word['id'],
        "kj": word['kanji'][0]['text'] if word['kanji'] else '',
        "kn": word['kana'][0]['text'] if word['kana'] else '',
        "e": word['sense'][0]['gloss'][0]['text'] if word['sense'] and word['sense'][0]['gloss'] else ''
    })

#write the extracted data to a new json file
with open('simplified_dictionnary.json', 'w', encoding='utf-8') as f:
    f.write('{\n"words": [\n')
    for obj in extracted_data:
        json.dump(obj, f, ensure_ascii=False)
        f.write(',\n')  # Add a newline character after each object