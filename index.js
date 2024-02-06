const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors')
require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_SECREET_KEY)
const port=process.env.PORT || 5000;

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.7auoehb.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();

    const shoesCollection=client.db('Shoes-World').collection('Shoes')
    const FormalCollection=client.db('Shoes-World').collection('Formal')
    const ChildCollection=client.db('Shoes-World').collection('Child-shoe')
    const addCollection=client.db('Shoes-World').collection('Add-Collection')


   app.get('/shoes',async(req,res)=>{
    const result=await shoesCollection.find().toArray();
    res.send(result)
   })

   app.get('/formal',async(req,res)=>{
    const result=await FormalCollection.find().toArray()
    res.send(result)
   })
   app.get('/child',async(req,res)=>{
    const result=await ChildCollection.find().toArray()
    res.send(result)
   })

   app.post('/addShoes',async(req,res)=>{
    const item=req.body;
    const result=await addCollection.insertOne(item)
    res.send(result)
   })
   app.get('/getShows',async(req,res)=>{
    
    const result=await addCollection.find().toArray();
    res.send(result)
   })


   app.delete('/deleteShows/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id: new ObjectId(id)}
  
    const result=await addCollection.deleteOne(query)
    res.send(result)
  })

  //update shows
  app.get('/shows/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)};
    const result=await addCollection.findOne(query)
    res.send(result)

  })
  app.put('/shows/:id',async(req,res)=>{
    const id=req.params.id;
    const filter={_id:new ObjectId(id)}
    const options = { upsert: true };
    const upDateTask=req.body;
    const shows = {
      
      $set: {
        shoeName:upDateTask.shoeName,
        image:upDateTask.image,
        price:upDateTask.price,
         
      },
    
    };
    const result = await addCollection.updateOne(filter, shows, options);
    res.send(result)
  })

  //payment system
  app.post("/create-payment-intent"), async (req, res)=>{

    const{price}=req.body;
    const amount=parseInt(price*100);
    const paymentIntent=await stripe.paymentIntents.create({
      amount:amount,
      currency: "usd",
      payment_method_types: ["card"],
    });
  
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  
  }
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})