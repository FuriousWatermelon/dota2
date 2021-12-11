# Dota2
This is the repo for Dota2 Hero/Item Recommendations

## Set Up
### For Mac OS and Linux users
Run `. util/setup.sh` in a terminal from the root of dota2. This script does the following
- Sets up Python virtual environment (in the `venv` directory)
- Installs the python dependencies within the virtual environment

### For windows users
Use anaconda to set up and install the package from `pip/environment.yml` using:

```
# open Anaconda Prompt
Anaconda Prompt
cd pip
conda env create -f environment.yml
conda activate myenv
```

## Running
To run the web application, please follow the following steps
### For Mac OS and Linux users
```
# open a new terminal and make sure venv is activated, run command below if not activated
source venv/bin/activate 
# start backend falsk server from main folder
cd main
python project.py

# open a second terminal and make sure venv is activated, run command below if not activated
source venv/bin/activate
# running python server from main folder
cd main
# start web server
python3 -m http.server 8000
```

Open any web browser (chrome/fire fox) and go to `http://localhost:8000/`

Then you can start navigate from `main.html`

### For windows users
```
# open Anaconda Prompt
Anaconda Prompt
# running backend flask from main folder
cd main
# start backend flask server
python project.py
# open another Anaconda Prompt
Anaconda Prompt
# running backend flask from main folder
cd main
# start web server
python -m http.server 8000
```

Open any web browser (chrome/fire fox) and go to `http://localhost:8000/`

Then you can start navigate from `main.html`

