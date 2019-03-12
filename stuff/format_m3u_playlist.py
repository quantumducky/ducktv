# Reads the m3u file from a current dir with the name of FILE_NAME and outputs a formated
# file with grouping by the alphabet and then year (if a 4 digit number is found in the title string)

import pprint, re

FILE_NAME = "TV_cont.m3u"

films = {}
urls = []

f = open(FILE_NAME, "r", encoding="utf8")

line = f.readline() # skip '#EXTM3U'
line = f.readline()

while line:
    if not line.startswith('#EXTINF'):
        line = f.readline()
        continue
    title = ','.join(line.split(',')[1:]).strip()
    url = f.readline().strip()
    if not url.startswith('http'):
        line = f.readline()
        continue
    year = int(re.findall(r'\d{4}', title)[0]) if re.findall(r'\d{4}', title) else 0
    key = title[0].upper() if title[0].isalpha() else '0-9'

    if key in films:
        if url not in urls:
            films[key].append((year, title, url))
            urls.append(url)
    else:
        films[key] = []
        films[key].append((year, title, url))
        urls.append(url)

    line = f.readline()

f.close()


keys = [*films]
keys.sort()

f = open("formated.m3u", "w", encoding="utf8")

f.write("#EXTM3U" + '\n')

for key in keys:
    film_group = films[key]
    film_group.sort()
    for film in film_group:
        f.write("#EXTINF:0," + film[1] + '\n')
        f.write("#EXTGRP:" + key + '\n')
        f.write(film[2] + '\n')

f.close()
