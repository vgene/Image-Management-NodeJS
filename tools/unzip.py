import sys
import subprocess
import os
import time
import json

orig="original/"
convert1="convert -resize 256x256! "
convert2="convert -resize 50x50! "
train="train/"
thumb="thumbnail/"
path=sys.argv[1]
savepath=sys.argv[2]
iname=sys.argv[3]
pos=path.rfind(".")
dir=path[:pos]
ext=path[pos:]

#check file format
if ext!=".zip" and ext!=".rar":
    sys.stderr.write("wrong file format,abort")
    sys.exit()
#check filename
if os.path.exists(dir):
    #print("Directory exists!delete original directory")
    subprocess.call("rm -rf "+dir,shell=True)
if ext==".zip":
    subprocess.call("mkdir "+dir,shell=True)
    unzipCmd="unzip "+path+" -d "+dir
elif ext==".rar":
    #todo
    sys.stderr.write("rar unavailable")
    sys.exit()
#print(unzipCmd)
unzip=subprocess.call(unzipCmd,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
#check unzip result
#print(unzip)
if unzip!=0:
    sys.stderr.write("unzip failed")
    sys.exit()
findCmd="find "+dir+" -name \"*.*\" "
findimage=subprocess.Popen(findCmd,shell=True,stdout=subprocess.PIPE)
findimage.wait()

filelist=[]
while True:
    buf=findimage.stdout.readline()
    buf=buf.replace("\n","")
    if buf=="":
        break
    if len(buf)>0:
        filelist.append(buf)

#print(len(filelist))
count=0
for file in filelist:
    ext=file[file.rfind("."):].lower()
    sys.stderr.write(ext+'\n')
    if ext!=".jpg" and ext!=".gif" and ext!=".png" and ext!=".jpeg":
        sys.stderr.write("file format error,abort")
        sys.exit()
    if os.path.getsize(file)==0:
        #print("empty file:"+file+", skip")
        continue
    #print(file)
    newfile="%s%s"%(iname,count)
    cpCmd="cp "+file+" "+savepath+orig+newfile+ext
    #cpCmd=cpCmd.replace("\n","")
    sys.stdout.write(newfile+"\n")
    copy=subprocess.call(cpCmd,shell=True)
    if copy!=0:
        subprocess.call("rm -rf "+dir,shell=True)
        sys.stderr.write("copy failed,abort")
        sys.exit()
    convert=subprocess.call(convert1+file+" "+savepath+train+newfile+".jpg",shell=True)
    if convert!=0:
        subprocess.call("rm -rf "+dir,shell=True)
        sys.stderr.write("convert to 256x256 failed!,abort")
        sys.exit()
    convert=subprocess.call(convert2+file+" "+savepath+thumb+newfile+".jpg",shell=True)
    if convert!=0:
        subprocess.call("rm -rf "+dir,shell=True)
        sys.stderr.write("convert to 50x50 failed!,abort")
        sys.exit()
    count=count+1

subprocess.call("rm -rf "+dir,shell=True)


