export function generateShareMessages(item) {
  const name = item.title
  const category = item.category
  const location = item.locationName || 'my area'

  const whatsapp = `🎁 I just gifted my ${name} to someone in need!\n\nPaying it forward — if you have unused ${category} lying around, share them on I Gift You and make someone's day! 💚\n\n#IGiftYou #GiftItForward #Reuse`

  const facebook = `🎁 Just gave away my ${name} through I Gift You!\n\nSomeone in ${location} now has a ${name} they needed — all for free! 🙌\n\nIf you have used toys, books, shoes, or clothes collecting dust, list them on I Gift You and let someone else enjoy them.\n\n#IGiftYou #GiftItForward #PayItForward #Reuse #Community`

  const twitter = `Just gifted my ${name} to someone who needed it! 🎁✨\n\nUsed items deserve a second life. Join me on I Gift You and gift what you no longer need.\n\n#IGiftYou #GiftItForward #Reuse`

  const instagram = `✨ Gifted! ✨\n\nMy ${name} found a new home today through I Gift You. There's nothing better than knowing something you no longer need is going to someone who truly wanted it 💚\n\nIf you have unused ${category} — toys, books, shoes, watches — list them for free and make someone happy!\n\n#IGiftYou #GiftItForward #PayItForward #Reuse #SustainableLiving #Community #GiveBack #SecondLife #UsedItems`

  return { whatsapp, facebook, twitter, instagram }
}
