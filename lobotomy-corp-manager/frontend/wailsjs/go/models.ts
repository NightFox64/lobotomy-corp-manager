export namespace backend {
	
	export class Task {
	    id: number;
	    title: string;
	    description: string;
	    deadline: string;
	    is_done: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.deadline = source["deadline"];
	        this.is_done = source["is_done"];
	    }
	}

}

