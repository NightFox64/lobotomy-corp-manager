export namespace backend {
	
	export class Task {
	    id: number;
	    title: string;
	    description: string;
	    deadline: string;
	    time: string;
	    is_done: boolean;
	    repeat: string;
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.deadline = source["deadline"];
	        this.time = source["time"];
	        this.is_done = source["is_done"];
	        this.repeat = source["repeat"];
	    }
	}

}

