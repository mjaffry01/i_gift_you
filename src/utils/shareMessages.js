export function generateShareMessages(item) {
  const name = item.title
  const category = item.category
  const location = item.locationName || 'my area'

  const whatsapp = `I just gifted my ${name} to someone in need!\n\nPaying it forward — if you have unused ${category} lying around, share them on Gift a Smile and make someone's day!\n\n#GiftASmile #GiftItForward #Reuse`

  const facebook = `Just gave away my ${name} through Gift a Smile!\n\nSomeone in ${location} now has a ${name} they needed — all for free!\n\nIf you have used toys, books, shoes, or clothes collecting dust, list them on Gift a Smile and let someone else enjoy them.\n\n#GiftASmile #GiftItForward #PayItForward #Reuse #Community`

  const twitter = `Just gifted my ${name} to someone who needed it!\n\nUsed items deserve a second life. Join me on Gift a Smile and gift what you no longer need.\n\n#GiftASmile #GiftItForward #Reuse`

  const instagram = `Gifted!\n\nMy ${name} found a new home today through Gift a Smile. There's nothing better than knowing something you no longer need is going to someone who truly wanted it.\n\nIf you have unused ${category} — toys, books, shoes, watches — list them for free and make someone happy!\n\n#GiftASmile #GiftItForward #PayItForward #Reuse #SustainableLiving #Community #GiveBack #SecondLife #UsedItems`

  return { whatsapp, facebook, twitter, instagram }
}
