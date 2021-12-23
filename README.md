### Lot Disposition Steps

# Meaning

    N = No Action (Pending)
    Y = Complete
    R = Reject
    E = Waiting for engineer
    P = Waiting for any approve
    S = Scrap (Complete)
    W = Waiting for instruction approve
    I = Instruction

# Steps

    N -> W -> I -> P -> E -> Y (Retest and Problem)
    N ->  I -> P -> E -> Y (Problem)
    N ->  W -> I -> P -> Y (Retest and Other)
    N ->  I -> P -> Y (Other)

# Changed

    1. 1 sentence
    2. 1 word
    3. 1 (once) a time

# Sonarqube

```bash
./node_modules/.bin/sonar-scanner -D"sonar.projectKey=ncrb" -D"sonar.login=cacb2fc921e
09ef7496b957e8813058305d6a5a7" -D"sonar.exclusions=node_modules/**, dist/**, reports/**,
 coverage/**, **/**.html, **/**.scss"
```
