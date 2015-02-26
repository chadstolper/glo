import web
import simplejson as json
import ast
import csv
import MySQLdb
from collections import defaultdict

urls = (
	'/', 'gui',
	'/data/(\d+)', 'data_request',
	'/(.*)', 'dataset',
)

render = web.template.render('templates')


class gui:
	def GET(self):
		d = {"dataset": "LesMis"}
		return render.gui(d)

class dataset:
	def GET(self, name):
		d = {}
		d["dataset"] = name
		return render.gui(d)

class data_request:
	def GET(self, id):
		id = int(id)
		d = {}

		database = ""
		q = ""
		if id == 1:
			database = "prodigalobservation"
			q = "SELECT source, target, weight  FROM   (  SELECT fromUser AS source, touser AS target, COUNT(*) AS weight  FROM imLink  WHERE eventdate>='2014-05-05' AND eventdate<'2014-05-19'   AND FLOOR(fromuser/1000)%10=1 AND FLOOR(touser/1000)%10=1  GROUP BY fromuser, touser  ) e   NATURAL JOIN  (	SELECT fromuser AS source  	FROM imLink   	WHERE eventdate>='2014-05-05' AND eventdate<'2014-05-19'   	AND FLOOR(fromuser/1000)%10=1 AND FLOOR(touser/1000)%10=1  	GROUP BY fromuser  	HAVING COUNT(DISTINCT touser) >= 3  ) u  "
		elif id == 2:
			database = "prodigalresult"
			q = "select fromImID, toImID, weight FROM imGraph WHERE (toImID = 9000 or fromImID = 9000) and eventDate between '2014-05-01' and '2014-05-31';"
		

		db = MySQLdb.connect(host="prodigal5", user="prodigal", passwd="prodigal", port=3307, db=database)
		cur = db.cursor() 
		cur.execute(q)

		edges = cur.fetchall()
		
		degree = defaultdict(int)
		for e in edges:
			degree[e[0]] += 1
			degree[e[1]] += 1
		
		nodes_set = set()
		for e in edges:
			nodes_set.add(e[0])
			nodes_set.add(e[1])
		vno = {}
		no = 0
		for v in nodes_set:
			vno[v] = no
			no += 1
		
		with open("./static/data/dynamic/nodes.csv", "wb") as f:
			writer = csv.writer(f, delimiter=',')
			writer.writerow( ["id", "label", "modularity_class", "degree"] )
			writer.writerows([[vno[v], v, 0, degree[v]] for v in nodes_set])
		with open("./static/data/dynamic/edges.csv", "wb") as f:
			writer = csv.writer(f, delimiter=',')
			writer.writerow( ["source", "target", "type", "id", "label", "weight"] )
			writer.writerows([[vno[edges[i][0]], vno[edges[i][1]], "Directed", i, "", edges[i][2]] for i in range(len(edges))])
		
		d["dataset"] = "dynamic"
		return render.gui(d)

class data_request2:
	def POST(self, s, t):
		m = model.Database(s)
		data = web.data()
		data = ast.literal_eval(data)
		d = m.get_table_instances(t, data)
		return json.dumps(d);


if __name__ == "__main__":
	app = web.application(urls, globals())
	app.internalerror = web.debugerror
	app.run()