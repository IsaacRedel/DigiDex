
from tkinter import *
from tkinter import ttk
from PIL import Image, ImageTk
from status import *
import random
import winsound


# Window
window = Tk()
window.title('')
window.geometry('650x610')
window.configure(bg="white")

ttk.Separator(window, orient=HORIZONTAL)

s = ttk.Style(window,)
s.theme_use("classic")

# Play music for background
winsound.PlaySound("sfx/braveHeart.wav", winsound.SND_FILENAME |
                   winsound.SND_ASYNC | winsound.SND_LOOP)


# Background Frame
frame_digi = Frame(window, width=650, height=390, relief='groove')
frame_digi.grid(row=1, column=0)


def swap_digimon(i):
    global image_digi

    # Switch the background color from frame
    frame_digi['bg'] = digimon[i]['infos'][3]

    # Wich digimon
    digi_name['text'] = i
    digi_name['bg'] = digimon[i]['infos'][3]
    digi_name_jp['text'] = digimon[i]['name'][0]
    digi_name_jp['bg'] = digimon[i]['infos'][3]

    image_digi = digimon[i]['name'][1]

    # Picture from digimon

    image_digi = Image.open(image_digi)
    image_digi = image_digi.resize((298, 298))
    image_digi = ImageTk.PhotoImage(image_digi)

    digi_image = Label(frame_digi, image=image_digi,
                       relief='flat', bg=digimon[i]['infos'][3], fg="black")
    digi_image.place(x=70, y=85)

    # Skills/attacks
    digi_at1['text'] = digimon[i]['attacks'][0]
    digi_at2['text'] = digimon[i]['attacks'][1]
    digi_at3['text'] = digimon[i]['attacks'][2]
    digi_at4['text'] = digimon[i]['attacks'][3]

    # Infos about digimon
    digi_level['text'] = digimon[i]['infos'][0]
    digi_att['text'] = digimon[i]['infos'][1]
    digi_family['text'] = digimon[i]['infos'][2]
    digi_ele['text'] = digimon[i]['infos'][4]


# Name for digimon
digi_name = Label(frame_digi, relief='flat', anchor=CENTER,
                  font=('DigimonBasic 24'), fg="white")
digi_name.place(x=12, y=15)

# Name for digimon in japanese
digi_name_jp = Label(frame_digi, relief='flat', anchor=CENTER,
                     font=('Arial 14 bold'), fg="white")
digi_name_jp.place(x=12, y=55)

digi_name_jp.lift()

# Attacks from digimon

digi_at = Label(window, text='Attacks', relief='flat',
                anchor=CENTER, font=('Times 20 bold'), bg="white", fg="black")
digi_at.place(x=15, y=410)

# Attack 1

digi_at1 = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_at1.place(x=15, y=460)

# Attack 2

digi_at2 = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_at2.place(x=15, y=485)

# Attack 3

digi_at3 = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_at3.place(x=15, y=510)

# Attack 4

digi_at4 = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_at4.place(x=15, y=535)

# Info from digimon

digi_info = Label(window, text='Infos', relief='flat',
                  anchor=CENTER, font=('Times 20 bold'), bg="white", fg="black")
digi_info.place(x=180, y=410)

# Level of digimon

digi_level = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_level.place(x=180, y=460)

# Attribute from digimon

digi_att = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_att.place(x=180, y=485)

# Family from digimon

digi_family = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_family.place(x=180, y=510)

# Element from digimon

digi_ele = Label(window, relief='flat', anchor=CENTER, font=(
    'Baskerville  12 italic'), bg="white", fg="black")
digi_ele.place(x=180, y=535)


# Buttons for digimon #


# Agumon button

image_digi_icon1 = Image.open('images/agumon_head.png')
image_digi_icon1 = image_digi_icon1.resize((50, 50))
image_digi_icon1 = ImageTk.PhotoImage(image_digi_icon1)

b_digi_1 = Button(frame_digi, command=lambda: swap_digimon('Agumon'), image=image_digi_icon1, text="Agumon ", width=180,
                  relief='sunken', overrelief=RIDGE, compound=LEFT, anchor=NW, padx=5, font=('Times 13'), bg="white", fg="black")
b_digi_1.place(x=440, y=20)

# Gabumon button

image_digi_icon2 = Image.open('images/gabumon_head.png')
image_digi_icon2 = image_digi_icon2.resize((50, 50))
image_digi_icon2 = ImageTk.PhotoImage(image_digi_icon2)

b_digi_2 = Button(frame_digi, command=lambda: swap_digimon('Gabumon'), image=image_digi_icon2, text="Gabumon ", width=180,
                  relief='sunken', overrelief=RIDGE, compound=LEFT, anchor=NW, padx=5, font=('Times 13'), bg="white", fg="black")
b_digi_2.place(x=440, y=85)

# Wargreymon button

image_digi_icon3 = Image.open('images/wargreymon_head.png')
image_digi_icon3 = image_digi_icon3.resize((50, 50))
image_digi_icon3 = ImageTk.PhotoImage(image_digi_icon3)

b_digi_3 = Button(frame_digi, command=lambda: swap_digimon('Wargreymon'), image=image_digi_icon3, text="Wargreymon ",
                  width=180, relief='sunken', overrelief=RIDGE, compound=LEFT, anchor=NW, padx=5, font=('Times 13'), bg="white", fg="black")
b_digi_3.place(x=440, y=150)

# Metal Garurumon button

image_digi_icon4 = Image.open('images/metalgarurumon_head.png')
image_digi_icon4 = image_digi_icon4.resize((50, 50))
image_digi_icon4 = ImageTk.PhotoImage(image_digi_icon4)

b_digi_4 = Button(frame_digi, command=lambda: swap_digimon('Metal Garurumon'), image=image_digi_icon4, text="Metal Garurumon ",
                  width=180, relief='sunken', overrelief=RIDGE, compound=LEFT, anchor=NW, padx=5, font=('Times 13'), bg="white", fg="black")
b_digi_4.place(x=440, y=215)

# Omegamon button

image_digi_icon5 = Image.open('images/omega_head.png')
image_digi_icon5 = image_digi_icon5.resize((50, 50))
image_digi_icon5 = ImageTk.PhotoImage(image_digi_icon5)

b_digi_5 = Button(frame_digi, command=lambda: swap_digimon('Omegamon'), image=image_digi_icon5, text="Omegamon ", width=180,
                  relief='sunken', overrelief=RIDGE, compound=LEFT, anchor=NW, padx=5, font=('Times 13'), bg="white", fg="black")
b_digi_5.place(x=440, y=280)

# Radomizer for wich digimon will show when the app run
random_digi = ['Agumon', 'Omegamon',
               'Gabumon', 'Metal Garurumon', 'Wargreymon']

digi_chosen = random.sample(random_digi, 1)
swap_digimon(digi_chosen[0])


window.mainloop()
