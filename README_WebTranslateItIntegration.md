# Webtranslateit
We use the service  [WebTranslateIt wti](www.webtranslateit.com) to manage the translation of ressources/segments into all supported languages.

The following overview should serve as a manual on how to integrate the developement with the translations.
Documentation: [https://webtranslateit.com/en/docs](https://webtranslateit.com/en/docs)

## Accounts 

Boris and Reto have "Manager" permissions and can add other users to specific translation teams.

## integration with source code and github

in the config.js of the web frontend we can configure for each environment whether to use the translations that 
are supplied with the code or to directly get current translations from wti. Normally we use the uat instance to
directly display the wti ressources, all other instances use the file based translations.

## Recommended procedure

1. Add new files/segments in the primary language to the code and check into github
2. upload the new files / added segments to wti (see below)
3. let the translators to the work on wti
4. download the newest translations from wti and check into github (see below)


## tools for the developer 

Install the wti command line tools [https://github.com/AtelierConvivialite/webtranslateit] (https://github.com/AtelierConvivialite/webtranslateit):

    gem install web_translate_it
maybe you need a "sudo" in front (in case of permission issues while installing it)

### adding new translation file to wti
 
- add new translation file in german to the code and check into github
- upload the new file:
```  
  wti add app/../../myName.translations.de.json
```    
### adding new segments into existing translation file  (called MERGE)

- add new segment into the translation file in german and check into github
- upload/merge the file to wti (using the -m option: merge)
```
    wti push -l de -m app/../../myName.translations.de.json
```    
### getting the newest translations from wti
- make sure you do not have local changes (like new segments, new files) as your translation files will be 
overwritten by the next step. If you have new segments/files upload them first to wti.
- then download the newest translations
```
    wti pull  # gets all target language files
    wti pull -l de # gets the primary language files
```    
- check the changes using IDEA diff commit before you commit everything to github.
    
### changing a translation string

--> use the wti UI to change the string, it is less dangerous in terms of overwriting work that translators have made.
If you really need to edit the translations in the code then follow this procedure:

For German:  (in case you only touch one/few files you can list the files instead of using "all")
```
    wti push -m -l de  # push and merge all NEW segments to wti
    wti pull -l de     # pull the latest changes from wti, overwrites your local files (recommended to make a branch before)
```
Then change all the german translations in the code (BUT do not change the keys!!!!), when you are finished:
```
    wti push -l de # pushes all the german language files, overwriting all german texts on wti!!!
```
All changes made on wti by translators in the pushed files segements between pulling and pushing will be overwritten, so work fast or at night ;-)

### changing translation keys

Changing keys is not really supported by wti. The procedure to follow is the same as above but wti will lose all 
history on segments whose keys have been changed. Basically the old key will be marked "obsolete" and the new key 
will be marked as new.




