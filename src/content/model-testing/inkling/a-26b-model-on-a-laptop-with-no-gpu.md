---
title: A 26B Model on a Laptop With No GPU
description: I squeezed Thinking Machines' Inkling 2 Mini down to 2 bits, ran it on my laptop with no graphics card, and kept throwing harder maths at it to find where it breaks.
date: 2026-11-24
build: 2-bit · 7.9 GB
rig: Laptop · no GPU
verdict: Near-flawless on hard maths and code it can check. Slow, at about 5 tokens a second.
---

Honestly I wasn't expecting anything out of this, a 26 billion parameter model crushed down to **2 bits** running on a laptop that I mostly use for writing and college stuff, my guess was it would load, say something that sounds smart and then completely fall apart the moment I asked it anything real. That's not what happened, and by the end of the day I was the one double checking my own answers instead of the model's

The dashed boxes are the model thinking to itself, and it reasons in a really weird way, you'll see

## The setup
*Not exactly an AI machine*

My laptop is a Galaxy Book with an Intel Core 5 120U, 15 GB of RAM and Intel integrated graphics which doesn't even have its own memory, it just borrows the same RAM. **No graphics card at all.**

The model is **Inkling 2 Mini** by Thinking Machines Lab. It's big, 26 billion parameters, but it only uses a small part of itself for each word it writes, which is the only reason it can run on a laptop at all

The full model is 52 GB, way more than my 15 GB of RAM, so I used a **compressed 7.9 GB version** from AtomicChat. Squeezing it that much has a cost, it agrees with the full model only **84%** of the time, so I wanted to see how much smarts were left

## How fast is it, really

| Setup | Reading a prompt | Writing a reply |
|---|---|---|
| Integrated GPU (Vulkan) | 27 tok/s | 4.7 tok/s |
| CPU, 8 threads | 17 tok/s | **5.5 tok/s** |
| CPU, 12 threads | — | 4.0 tok/s |

So we're looking at about **five words a second**, that's basically reading speed, you literally watch it type the answer out

## Test 1: a warm-up
*Something I could grade in my head*

I started easy, why is the sky blue, why are sunsets red, how much more is blue light scattered than red, and write some code for it

It got everything, Rayleigh scattering, the 1/λ⁴ law, (700/450)⁴ ≈ 5.85, a working Python function, the whole thing. Then it said "about 5.8×" which is 5.85 rounded the wrong way, a tiny slip but exactly the kind you'd expect from a model squeezed this hard, time to make it harder

## Test 2: a Pell equation
*Hard, but checkable*

Next I gave it something hard that can actually be verified, find every pair of positive whole numbers with x below a million that satisfies

**x² − 3y² = 1**

then prove none are missing, prove there are infinitely many and write the code

It recognised it as a Pell equation right away, found the smallest solution (2, 1) and instead of just reciting the formula for the next ones it derived it, by multiplying x + y√3 by 2 + √3 and expanding

The proof was the interesting part. To show nothing is missing you have to rule out a solution sneaking in between the known ones, it wrote one proof by splitting into cases, then noticed it had assumed a number was positive without checking, went back and covered that case too, and then found a second much cleaner argument and was visibly happy about it

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>If a=1, then β+β'=2. But β+1/β=2 implies β=1 (since t+1/t=2 has t=1). Then β=1, b=0. If a=2, β+1/β=4. … So β=ε, contradiction to β&lt;ε. Nice! This is elegant and rigorous.</p>
</figure>

It used the sandbox to list the solutions and ran into a bug in its own code, and you can see the exact moment it figured out why

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>In JS, .toString has higher? Actually unary? x*x.toString() means x*(x.toString()) because method call binds to x.toString() not (x*x).toString. Yes wrong. Need use (x*x).toString().</p>
</figure>

That's a proper operator precedence bug and it diagnosed it correctly. And then it didn't even trust the computer, it squared 978,122 by hand as (978,000 + 122)² and got 956,722,646,884, did 564,719² the same way, and I checked every single number, all exact

Final answer, **11 pairs**, every digit right from (2, 1) to (978122, 564719), plus the next pair just to show where the list stops, two proofs and working code

## Test 3: a problem you can't brute-force
*Finding the actual limit*

At this point I genuinely wanted to see it break, so I asked something a computer can't just grind through, **how many whole numbers up to one trillion are squarefree**, meaning not divisible by 4, 9, 25 or any other perfect square above 1

Checking a trillion numbers one by one would take days even with the sandbox, you need the right idea, which is the Möbius function, it turns the whole thing into a sum over just one million terms. There's also a trap sitting in there, the answer is famously close to 6/π² of the total, so a model that leans on that shortcut gives a number that looks right and isn't

It found the method by itself, and rather than just stating the formula it tested why it works on small examples first

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>sum μ(d) over d|6: d=1:1,2:-1,3:-1,6:μ(6)=1? … total 1-1-1+1=0. Good. n=24: s=2? 4|24 yes, d=1 μ=1,d=2 μ=-1 total 0. Squarefree n: d=1 only sum 1.</p>
</figure>

Later on it found the textbook one-liner version of the same proof

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>Nice direct proof: μ(d)=0 if d has any squared prime; for d|r, only squarefree divisors (subsets of distinct primes of r) contribute; sum_{S⊆primes(r)} (-1)^{|S|} = (1-1)^{ω(r)}=0 if ω(r)≥1; if r=1 then =1. Very clear.</p>
</figure>

It worried about precision before writing a single line of code because the numbers get close to what JavaScript can store exactly, then wrote a sieve for a million values, tested it against brute force for every number up to 20, got an answer, threw the whole sieve away, rewrote it from scratch with exact big integers and got the same answer again

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>Independent computation gives same sum. Good.</p>
</figure>

**607,927,102,274.** I had worked out the answer beforehand and kept it hidden from the chat, it matches to the last digit, and it's 420 more than the 6/π² shortcut which the model also reported, so no, it didn't fall for the trap

Then it did something I never asked for, it noticed that the textbook error bound for this shortcut is around a million while the real gap was only 420, and it got suspicious of its own answer

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>But our difference 420 is much smaller; is that accurate? … Is 420 plausible? Let's investigate.</p>
</figure>

So it took the gap apart with more code and split the 420 into two pieces, about −186 from cutting the infinite series off at one million and about +234 from all the rounding down inside the formula, the two nearly cancel each other out which is exactly why the shortcut lands so close

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>Need explain: the floor errors are not random; their signed sum is +233.57, not O(√N) in magnitude (but maybe O(√N) bound is loose). So exact difference from constant approx is: tail (constant - partial sum) ≈ -186.4 and floor signed error ≈ +233.6, sum ≈ +420. Good.</p>
</figure>

I checked that split myself, 186.4 and 233.5, it's right

To be fair though, I solved this with the exact same method, it didn't find some genius route that a number theorist wouldn't. What got me is that a **7.9 GB file running on a laptop CPU** knew which route to take, built it without a single bug, checked it two separate ways and didn't take the shortcut that looks right

## What I learned
*Ugly thinking, right answers*

**Its reasoning is ugly and it works.** The internal monologue is choppy shorthand, "Need…", "Wait…", "Hmm…", half sentences, the same check done three or four times over, if you only read the final answers you'd never guess how messy the road was. But the mess is kind of the point, it keeps asking itself "is that actually right?" and going back

**It knows when it can check and it uses that.** Every time it had the sandbox or an exact method it was close to flawless, it tested its own code, redid its own arithmetic and only then committed, and that lines up with its public benchmarks too, strong at coding and maths, weaker at long chains of fuzzy instructions

**The compression shows up in the small stuff.** A rounding slip here, a garbled "2^6 * 5^6 = 6415625" there, a moment of doubt about how big a number is, and my favourite, right after correctly taking apart a 420-in-600-billion error, it completely tied itself in knots trying to turn that into a percentage

<figure class="monologue">
<figcaption>Inkling, reasoning</figcaption>
<p>Wait 6.9e-8 percent = 0.000000069? No: 6.9e-8 percent equals 0.000000069? … Confusing. Let's avoid percent or state relative error fraction.</p>
</figure>

It knew it was confused and just walked around it [*relatable honestly*], and none of these wobbles ever made it into the final answer of a problem it could check

**The price is time and heat.** At five tokens a second the Pell answer took the better part of an hour because it kept checking its own work, and the CPU sat at 89–94°C with the fan going full blast the whole time. Nothing throttled and nothing got damaged, but this isn't something I'd run all day, unplugging the charger let the power settings calm it down to 73°C

## The honest verdict
*Where I'd put it*

On the leaderboards Inkling 2 Mini sits near the top of small open models and well below the frontier ones. After running two bits of it on my laptop I'd say, for problems where the answer can be checked it reasons like a much bigger model, and you just need patience

A few years ago this kind of reasoning needed a **data centre**, today it ran offline on my laptop from a single 7.9 GB file, I don't fully know what to make of that yet but I know it's a big deal

## Run it yourself

You need llama.cpp build b12600 or newer and the AtomicChat file from Hugging Face

```sh
git clone https://github.com/ggml-org/llama.cpp
cmake -S llama.cpp -B llama.cpp/build -DCMAKE_BUILD_TYPE=Release
cmake --build llama.cpp/build --target llama-server -j

curl -L -o Inkling-2-Mini-AD-IQ2_XXS-Q2.gguf \
  https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF/resolve/main/Inkling-2-Mini-AD-IQ2_XXS-Q2.gguf

llama.cpp/build/bin/llama-server -m Inkling-2-Mini-AD-IQ2_XXS-Q2.gguf \
  -t 8 -fa on -c 65536 -np 1 --jinja --port 8080
```

Then open `http://127.0.0.1:8080`. Keep the context big (`-c 65536`), my first run used 8K and the model filled the whole thing with reasoning halfway through an answer. For normal everyday questions send `"chat_template_kwargs": {"reasoning_effort": "low"}`, otherwise it'll spend ten minutes thinking about "hi"
