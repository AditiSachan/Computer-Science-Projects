import mysql.connector
from prettytable import PrettyTable
mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="system",
  auth_plugin='mysql_native_password'
)

############## MYSQL
mycursor = mydb.cursor()

mycursor.execute("CREATE DATABASE IF NOT EXISTS results;")

mycursor.execute("USE results")

mycursor.execute("""CREATE TABLE IF NOT EXISTS leaderboard(
   SrNo INT PRIMARY KEY AUTO_INCREMENT,
   Name TEXT,
   Score INT
)""")
mycursor.execute("DROP TABLE IF EXISTS userResult")
mycursor.execute("""CREATE TABLE userResult(
   Question INT PRIMARY KEY AUTO_INCREMENT ,
   YourAnswer VARCHAR(256),
   CorrectAnswer VARCHAR(256),
   Score INT
)""")
mydb.commit()


#################
# creating quiz on current affairs
def current():
    def ans(questions):
        for i in questions:
            print(i)
            flag1 = input("Do you want to skip this question (yes/no)")
            if flag1 == "yes":
                global scount
                scount += 1
                mycursor.execute(
                    "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES ( \"Skipped\", '" + questions[i] + "', " + str(
                        0) + ");")
                mydb.commit()
                continue
            else:
                global score
                global ccount
                global wcount
                ans1 = input("enter the answer (a/b/c/d):")
                if ans1 == questions[i]:
                    print("correct answer,you got 1 point")
                    score = score + 1
                    ccount += 1
                    mycursor.execute(
                        "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES (\"" + ans1 + "\", \"" + questions[i] + "\", " + str(
                            1) + ");")
                    mydb.commit()
                else:
                    print("wrong answer,you lost 1 point")
                    wcount += 1
                    score = score - 1
                    mycursor.execute(
                        "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES (\"" + ans1 + "\", \"" +
                        questions[i] + "\", " + str(
                            -1) + ");")
                    mydb.commit()
                flag2 = input("Do you want to quit and submit(yes/no):")
                if flag2 == "yes":
                    break
    # creating a submit button
    def submit():
        from tkinter import Button, Tk, Label
        def callback():
            print("Answers Submitted")
            root = Tk()
            root.geometry('200x80')
            L1 = Label(root, text="CONFIRM SUBMISSION")
            L1.grid(row=1, column=1)
            MyButton1 = Button(root, text="Submit", width=28, command=root.destroy)
            MyButton1.grid(row=2, column=1)
            root.mainloop()
            callback()

    # plotting the results table
    def results():
        global scount
        global ccount
        global wcount
        print(scount, ccount, wcount)
        mycursor.execute(
            "INSERT INTO leaderboard(Name, Score) VALUES (\"" + nameOfUser + "\" ," + str(score) + ");")
        mydb.commit()
        print("\n\n**************************YOUR SCORESHEET**************************")
        mycursor.execute("SELECT * FROM userresult");
        myresult = mycursor.fetchall()
        pt = PrettyTable(["Question Number", "Your Answer", "Correct Answer", "Score"])
        for x in myresult:
            pt.add_row(x)
        print(pt)
        print("\n\n**************************Leaderboard**************************")
        mycursor.execute("SELECT * FROM leaderboard");
        myresult = mycursor.fetchall()
        pt = PrettyTable(["Serial Number", "Name", "Score"])
        for x in myresult:
            pt.add_row(x)
        print(pt)
        z = input("Type \"yes\" to see your performance:")
        if z == "yes" or z == "Yes":
            from matplotlib import pyplot
            mark = [scount, ccount, wcount]
            col = ['y', 'g', 'r']
            title = ["Skipped", "Correct Answers", "Incorrect Answers"]
            pyplot.axis("equal")
            pyplot.pie(mark, labels=title, colors=col, autopct="%1.1f%%")


    print("Let us test your general knowledge")
    q1 = """Which F1 racing driver has clinched Turkish Grand Prix 2020 Championship?
    a.Lewis Hamilton
    b.Charles Leclerc
    c.Max Verstappen
    d.Sebastien Vettel"""
    q2 = """Which Indian company has commenced phase 3 trials of Covid-19 vaccine 'Covaxin'?
    a.Biocon
    b.Bharat Biotech
    c.Serum Institute of India
    d.Dr Reddys Lab"""
    q3 = """Which organisation developed Quick Reaction Surface-to-Air Missile(QRSAM), which was seen in news recently?
    a.DRDO
    b.HAL
    c.Tesla
    d.Larsen & Toubro"""
    q4 = """The International Court of Justice is based in which country?
    a.United States
    b.United Kingdom
    c.The Netherlands
    d.France"""
    q5 = """Which sportsperson has clinched the ITTF Women's World Cup title?
    a.Manika Batra
    b.Chen Meng
    c.Zhu Yuling
    d.Liu Shewin"""
    q6 = """As per a recent study by 'National Oceanic and Atmospheric Administration', the Coral reefs of which country is found to have degraded significantly?
    a.India
    b.United States
    c.Australia
    d.France"""
    q7 = """Which country is developing satellite to predict bush-fire danger zones?
    a.New Zealend
    b.Australia
    c.South Korea
    d.Philippines"""
    q8 = """Who won the XMR catergory?
    a.Rafael Nadal
    b.Novak Djokovic
    c.Alexander Zverev
    d.Daniil Medvedev"""
    q9 = """Where will be the venue for the International Bird Festival to be organised in February 2021?
    a.Ahmedabad,Gujarat
    b.Varanasi,Uttar Pradesh
    c.Kevadiya,Gujarat
    d.Gorakhpur,Uttar Pradesh"""
    q10 = """Who won the International Children's Peace Prize 2020?
    a.Greta Thunberg
    b.Sadat Rahman
    c.Aava Murto
    d.Khusi Chindaliya"""
    questions = {q1: "a", q2: "b", q3: "a", q4: "c", q5: "b", q6: "b", q7: "b", q8: "d", q9: "d", q10: "b"}
    ans(questions)
    a = submit()
    results()

# creating quiz on health
def health():
    def ans(ques):
        for i in (ques):
            print(i)
            flag1 = input("Do you want to skip this question(Yes/No):")
            if flag1 == "yes":
                global scount
                scount += 1
                mycursor.execute(
                    "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES ( \"Skipped\", '" + ques[
                        i] + "', " + str(
                        0) + ");")
                mydb.commit()
                continue
            else:
                global score
                global ccount
                global wcount
                answer = input("Enter your answer(a/b/c/d):")
                if answer == ques[i]:
                    print("Correct Answer,you got 1 point")
                    ccount += 1
                    score += 1
                    mycursor.execute(
                        "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES (\"" + answer + "\", \"" +
                        ques[i] + "\", " + str(
                            1) + ");")
                    mydb.commit()
                else:
                    print("Wrong Answer, you lost one point")
                    wcount += 1
                    score -= 1
                    mycursor.execute(
                        "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES (\"" + answer + "\", \"" +
                        ques[i] + "\", " + str(
                            -1) + ");")
                    mydb.commit()
                flag2 = input("Do you want to quit and submit(Yes/No):")
                if flag2 == "yes":
                    break

    # creating a submit button
    def submit():
        from tkinter import Button, Tk, Label
        def callback():
            print("Answers Submitted")
            root = Tk()
            root.geometry('200x80')
            L1 = Label(root, text="CONFIRM SUBMISSION")
            L1.grid(row=1, column=1)
            MyButton1 = Button(root, text="Submit", width=28, command=root.destroy)
            MyButton1.grid(row=2, column=1)
            root.mainloop()
            callback()

    # plotting the results table
    def results():
        global scount
        global ccount
        global wcount
        print(scount, ccount, wcount)
        mycursor.execute(
            "INSERT INTO leaderboard(Name, Score) VALUES (\"" + nameOfUser + "\" ," + str(score) + ");")
        mydb.commit()
        print("\n\n**************************YOUR SCORESHEET**************************")
        mycursor.execute("SELECT * FROM userresult");
        myresult = mycursor.fetchall()
        pt = PrettyTable(["Question Number", "Your Answer", "Correct Answer", "Score"])
        for x in myresult:
            pt.add_row(x)
        print(pt)
        print("\n\n**************************Leaderboard**************************")
        mycursor.execute("SELECT * FROM leaderboard");
        myresult = mycursor.fetchall()
        pt = PrettyTable(["Serial Number", "Name", "Score"])

        for x in myresult:
            pt.add_row(x)
        print(pt)
        z = input("Type \"yes\" to see your performance:")
        if z == "yes" or z == "Yes":
            from matplotlib import pyplot
            mark = [scount, ccount, wcount]
            col = ['y', 'g', 'r']
            title = ["Skipped", "Correct Answers", "Incorrect Answers"]
            pyplot.axis("equal")
            pyplot.pie(mark, labels=title, colors=col, autopct="%1.1f%%")

    print("Choose the appropriate option:")
    Q1 = """What does COVID-19 stand for?
    a)A term for Coronavirus Disease 19, because it's the 19th strain of coronavirus discovered.
    b)It's a term that stands for Coronavirus Disease 2019, the year it was first identified.
    c)Both a and b
    d)None of the above"""
    Q2 = """What other viruses belong to the coronavirus family?
    a)SARS and Influenza
    b)SARS and MERS
    c)SARS and HIV
    d)CTFV AND MERS"""
    Q3 = """How does weather seem to affect the novel coronavirus?
    a)The virus can't survive in hot, humid climates.
    b)Cold temperatures can kill the virus.
    c)It is not yet known.
    d)Other"""
    Q4 = """Mild Symptoms of Novel coronavirus are:
    a)Fever
    b)Cough
    c)Shortness of breath
    d)All the above"""
    Q5 = """Which of the following statement is/are correct about Favipiravir?
    a)Favipiravir is an antiviral COVID-19 drug.
    b)Glenmark Pharmaceuticals under the brand name FabiFlu has launched an antiviral drug Favipiravir.
    c)It is India's first COVID-19 drug launched, priced at Rs 103 per tablet.
    d)All the above are correct"""
    Q6 = """Thailand announced that it has proceeded to test its novel coronavirus vaccine on which animal/bird?
    a)Monkeys
    b)Lizards
    c)Hens
    d)Kites"""
    Q7 = """Name a clinical trial in which blood is transfused from recovered COVID-19 patients to a coronavirus patient who is in critical condition?
    a)Plasma Therapy
    b)Solidarity
    c)Remdesivir
    d)Hydroxychloroquine"""
    Q8 = """The first case of novel coronavirus was identified in
    a)Beijing
    b)Shanghai
    c)Wuhan, Hubei
    d)Tianjin"""
    Q9 = """From where has coronavirus got its name?
    a)Due to their crown-like projections.
    b)Due to their leaf-like projections.
    c)Due to their surface structure of bricks.
    d)None of the above"""
    Q10 = """ How does Coronavirus transmit?
    a)When a person sneezes or cough, droplets spread in the air or fall on the ground and nearby surfaces.
    b)If another person is nearby and inhales the droplets or touches these surfaces and further touches his face, eyes or mouth, he or she can get an infection.

    c)If the distance is less than 1 meter from the infected person.
    d)All the above are correct."""
    ques = {Q1: "b", Q2: "b", Q3: "a", Q4: "d", Q5: "d", Q6: "a", Q7: "a", Q8: "c", Q9: "a", Q10: "d"}
    ans(ques)
    submit()
    results()

# creating quiz on entertainment
def entertainment():
    def ans(ques):
        for i in ques:
            print(i)
            flag1 = input("Do you want to skip this question(yes/no):")
            if flag1 == "yes":
                global scount
                scount += 1
                mycursor.execute(
                    "INSERT INTO userResult (YourAnswer, CorrectAnswer, Score) VALUES ( \"Skipped\", '" + ques[i] + "', 0);")
                mydb.commit()
                continue
            else:
                answer = input("Enter the answer (a/b/c/d):")

                if answer == ques[i]:
                    print("Correct Answer,you got 1 point")
                    global ccount
                    global score
                    ccount += 1
                    score += 1
                    mycursor.execute(
                        "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES (\"" + answer + "\", \"" +
                        ques[i] + "\", " + str(
                            1) + ");")
                    mydb.commit()
                else:
                    print("Wrong answer,you lost 1 point")
                    global wcount
                    wcount += 1
                    score -= 1
                    mycursor.execute(
                        "INSERT INTO userResult(YourAnswer, CorrectAnswer, Score) VALUES (\"" + answer + "\", \"" +
                        ques[i] + "\", " + str(
                            -1) + ");")
                    mydb.commit()
                flag2 = input("Do you want to quit and submit(yes/no):")
                if flag2 == "yes":
                    break
    # creating a submit button
    def submit():
        from tkinter import Button, Tk, Label
        def callback():
            print("Answers Submitted")
            root = Tk()
            root.geometry('200x80')
            L1 = Label(root, text="CONFIRM SUBMISSION")
            L1.grid(row=1, column=1)
            MyButton1 = Button(root, text="Submit", width=28, command=root.destroy)
            MyButton1.grid(row=2, column=1)
            root.mainloop()

    # plotting the results table
    def results():
        global scount
        global ccount
        global wcount
        print(scount, ccount, wcount)
        mycursor.execute(
            "INSERT INTO leaderboard(Name, Score) VALUES (\"" + nameOfUser + "\" ," + str(score) + ");")
        mydb.commit()
        print("\n\n**************************YOUR SCORESHEET**************************")
        mycursor.execute("SELECT * FROM userresult");
        myresult = mycursor.fetchall()
        pt = PrettyTable(["Question Number", "Your Answer", "Correct Answer", "Score"])
        #pt.set_padding_width(1)  # One space between column edges and contents (default)
        for x in myresult:
            pt.add_row(x)
        print(pt)
        print("\n\n**************************Leaderboard**************************")
        mycursor.execute("SELECT * FROM leaderboard");
        myresult = mycursor.fetchall()
        pt = PrettyTable(["Serial Number", "Name", "Score"])
        for x in myresult:
            pt.add_row(x)
        print(pt)
        z = input("Type \"yes\" to see your performance:")
        if z == "yes" or z == "Yes":
            from matplotlib import pyplot
            pyplot.show(block=True)
            mark = [scount, ccount, wcount]
            col = ['y', 'g', 'r']
            title = ["Skipped", "Correct Answers", "Incorrect Answers"]
            pyplot.axis("equal")
            pyplot.pie(mark, labels=title, colors=col, autopct="%1.1f%%")
            pyplot.show()

    choice = input("Prefer Hollywood OR Bollywood? (H/B):")
    if choice == "H" or choice == "h":
        print("Guess which movie these famous quotes belong to")
        Q1 = """ Just keep swimming.
        a)Finding Nemo
        b)Brokeback Mountain
        c)Gone With the Wind
        d)None of these"""
        Q2 = """Why so serious?
        a)The Wizard of Oz
        b)The Dark Knight
        c)The Godfather
        d)None of these"""
        Q3 = """May the Force be with you
        a)All About Eve
        b)Harry Potter and the Goblet of Fire
        c)Star Wars
        d)None of these"""
        Q4 = """Bond. James Bond.
        a)Apocalypse Now
        b)Sunset Boulevard
        c)Dr.No
        d)None of these"""
        Q5 = """I'll be back.
        a)Jaws
        b)The Terminator
        c)Casablanca
        d)None of these"""
        Q6 = """I'm king of the world
        a)Titanic
        b)Lion king
        c)The Mummy
        d)None of these"""
        Q7 = """ All we have to decide what to do with the time that given to us
        a)Harry Potter and the Prisoner of Azkaban
        b)Chronicles of Narnia
        c)Lord Of The Ring - The Fellowships of The Ring
        d)None of these """
        Q8 = """I’ll be in my bedroom, making no noise and pretending I’m not there
        a)Harry Potter and the Sorcerer's Stone
        b)Harry Potter and the Chamber of Secrets
        c)Planet of the Apes
        d)None of these """
        Q9 = """ Life’s simple. You make choices and you don’t look back.
        a)The Fast and The Furious: Tokyo Drift
        b)La La Land
        c)The Matrix
        d)None of these"""
        Q10 = """ My good opinion once lost, is lost forever.
        a)Pride and Prejudice
        b)The Sawshank Redemption
        c)Mission: Impossible
        d) None of these """
        ques = {Q1: "a", Q2: "b", Q3: "c", Q4: "c", Q5: "b", Q6: "a", Q7: "c", Q8: "b", Q9: "a", Q10: "a"}
        ans(ques)
        submit()

    elif choice == "B" or choice == "b":
        print("Guess which moive these quotes belong to")
        Q1 = """ Kitney aadmi the
        a)Sholay
        b)Darbar
        c)Tanhaji
        d)None of these """
        Q2 = """ Main aaj bhi pheke hue paise nahin uthata
        a)Thhapad
        b)Deewar
        c)English Vinglish
        d)None of these """
        Q3 = """ Pushpa, I hate tears...
        a)Om Shanti Om
        b)Devdas
        c)Amar prem
        d)None of these """
        Q4 = """ Mogambo khush hua!
        a)Dabangg
        b)Don
        c)Mr.India
        d)None of these"""
        Q5 = """ Taareekh pe taareekh, taareekh pe taareekh, taarekh pe taareekh
        a)Munna Bhai M.B.B.S
        b)Damini
        c)Zindagi na milegi doobara
        d)None of these """
        Q6 = """ Kabhi Kabhi Kuch Jeetne Ke Liya Kuch Haar Na Padta Hai. Aur Haar Ke Jeetne Wale Ko Baazigar Kehte Hain
        a)Baazigar
        b)Mughal-e-Azam
        c)Pakeezah
        d)None of these """
        Q7 = """ Crime Master Gogo naam hai mera, aankhen nikal ke gotiyan khelti hun main.
        a)Dear Zindagi
        b)Chhapak
        c)Andaz Apna Apna
        d)None of these """
        Q8 = """ Hum jahan khade ho jaate hain, line wahi se shuru hoti hain
        a)Khoobsurat
        b)Kaalia
        c)Bajrangi Bhaijan
        d)None of these """
        Q9 = """ Mhari Choriyan Choron Se Kam Hain Ke
        a)Dangal
        b)PK
        c)Sultan
        d)None of these """
        Q10 = """ Mere Karan Arjun Aayenge. Zameen Ki Chaati Phad Ke Aayenge, Aasman Ka Seena Cheer Ke Aayenge
        a)Karan Arjun
        b)Queen
        c)Golmaal
        d)None of these """
        ques = {Q1: "a", Q2: "b", Q3: "c", Q4: "c", Q5: "b", Q6: "a", Q7: "c", Q8: "b", Q9: "a", Q10: "a"}
        ans(ques)
        submit()
    results()


# Quiz C.S project
# Main
# Welcome message and choosing a topic
score = 0
scount = 0
ccount = 0
wcount = 0
print("Welcome to the quiz")
nameOfUser = input("Please enter your name :")
print(nameOfUser, ",", "Rules for the quiz are:")
print("1. +1 for every right answer", "2. -1 for every wrong answer", "3. 0 marks for the questions skipped",
      "4. You can quit the quiz anytime", sep="\n")
b = input("Would you like to continue(yes/no):")
if b == "yes" or b == "Yes":
    print("There are 3 topics:")
    print("1. Current affairs", "2. Health", "3. Entertainment", sep="\n")
    c = int(input("Enter your number of choice:"))
    if c == 1:
        current()

    elif c == 2:
        health()
    else:
        entertainment()